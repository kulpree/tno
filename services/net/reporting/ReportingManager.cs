using System.Security.Claims;
using System.Text.Json;
using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TNO.Ches;
using TNO.Ches.Configuration;
using TNO.Ches.Models;
using TNO.Core.Exceptions;
using TNO.Core.Extensions;
using TNO.Elastic.Models;
using TNO.Entities;
using TNO.Kafka;
using TNO.Kafka.Models;
using TNO.Services.Managers;
using TNO.Services.Reporting.Config;
using TNO.TemplateEngine;
using TNO.TemplateEngine.Models.Reports;

namespace TNO.Services.Reporting;

/// <summary>
/// ReportingManager class, provides a Kafka Consumer service which imports audio from all active topics.
/// </summary>
public class ReportingManager : ServiceManager<ReportingOptions>
{
    #region Variables
    private CancellationTokenSource? _cancelToken;
    private Task? _consumer;
    private readonly TaskStatus[] _notRunning = new TaskStatus[] { TaskStatus.Canceled, TaskStatus.Faulted, TaskStatus.RanToCompletion };
    private int _retries = 0;
    private readonly JsonSerializerOptions _serializationOptions;
    private readonly ClaimsPrincipal _user;
    #endregion

    #region Properties
    /// <summary>
    /// get - Kafka Consumer.
    /// </summary>
    protected IKafkaListener<string, ReportRequestModel> Listener { get; }

    /// <summary>
    /// get - Razor report template engine.
    /// </summary>
    protected IReportEngine ReportEngine { get; }

    /// <summary>
    /// get - CHES service.
    /// </summary>
    protected IChesService Ches { get; }

    /// <summary>
    /// get - CHES options.
    /// </summary>
    protected ChesOptions ChesOptions { get; }
    #endregion

    #region Constructors
    /// <summary>
    /// Creates a new instance of a ReportingManager object, initializes with specified parameters.
    /// </summary>
    /// <param name="listener"></param>
    /// <param name="api"></param>
    /// <param name="user"></param>
    /// <param name="reportEngine"></param>
    /// <param name="chesService"></param>
    /// <param name="chesOptions"></param>
    /// <param name="serializationOptions"></param>
    /// <param name="reportOptions"></param>
    /// <param name="logger"></param>
    public ReportingManager(
        IKafkaListener<string, ReportRequestModel> listener,
        IApiService api,
        ClaimsPrincipal user,
        IReportEngine reportEngine,
        IChesService chesService,
        IOptions<ChesOptions> chesOptions,
        IOptions<JsonSerializerOptions> serializationOptions,
        IOptions<ReportingOptions> reportOptions,
        ILogger<ReportingManager> logger)
        : base(api, reportOptions, logger)
    {
        _user = user;
        this.ReportEngine = reportEngine;
        this.Ches = chesService;
        this.ChesOptions = chesOptions.Value;
        _serializationOptions = serializationOptions.Value;
        this.Listener = listener;
        this.Listener.IsLongRunningJob = true;
        this.Listener.OnError += ListenerErrorHandler;
        this.Listener.OnStop += ListenerStopHandler;
    }
    #endregion

    #region Methods
    /// <summary>
    /// Listen to active topics and import content.
    /// </summary>
    /// <returns></returns>
    public override async Task RunAsync()
    {
        var delay = this.Options.DefaultDelayMS;

        // Always keep looping until an unexpected failure occurs.
        while (true)
        {
            if (this.State.Status == ServiceStatus.RequestSleep || this.State.Status == ServiceStatus.RequestPause)
            {
                // An API request or failures have requested the service to stop.
                this.Logger.LogInformation("The service is stopping: '{Status}'", this.State.Status);
                this.State.Stop();

                // The service is stopping or has stopped, consume should stop too.
                this.Listener.Stop();
            }
            else if (this.State.Status != ServiceStatus.Running)
            {
                this.Logger.LogDebug("The service is not running: '{Status}'", this.State.Status);
            }
            else
            {
                try
                {
                    var topics = this.Options.Topics.Split(',', StringSplitOptions.RemoveEmptyEntries);

                    if (topics.Length != 0)
                    {
                        this.Listener.Subscribe(topics);
                        ConsumeMessages();
                    }
                    else if (topics.Length == 0)
                    {
                        this.Listener.Stop();
                    }
                }
                catch (Exception ex)
                {
                    this.Logger.LogError(ex, "Service had an unexpected failure.");
                    this.State.RecordFailure();
                }
            }

            // The delay ensures we don't have a run away thread.
            this.Logger.LogDebug("Service sleeping for {delay} ms", delay);
            await Task.Delay(delay);
        }
    }

    /// <summary>
    /// Creates a new cancellation token.
    /// Create a new Task if the prior one isn't running anymore.
    /// </summary>
    private void ConsumeMessages()
    {
        if (_consumer == null || _notRunning.Contains(_consumer.Status))
        {
            // Make sure the prior task is cancelled before creating a new one.
            if (_cancelToken?.IsCancellationRequested == false)
                _cancelToken?.Cancel();
            _cancelToken = new CancellationTokenSource();
            _consumer = Task.Run(ListenerHandlerAsync, _cancelToken.Token);
        }
    }

    /// <summary>
    /// Keep consuming messages from Kafka until the service stops running.
    /// </summary>
    /// <returns></returns>
    private async Task ListenerHandlerAsync()
    {
        while (this.State.Status == ServiceStatus.Running &&
            _cancelToken?.IsCancellationRequested == false)
        {
            await this.Listener.ConsumeAsync(HandleMessageAsync, _cancelToken.Token);
        }

        // The service is stopping or has stopped, consume should stop too.
        this.Listener.Stop();
    }

    /// <summary>
    /// The Kafka consumer has failed for some reason, need to record the failure.
    /// Fatal or unexpected errors will result in a request to stop consuming.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    /// <returns>True if the consumer should retry the message.</returns>
    private void ListenerErrorHandler(object sender, ErrorEventArgs e)
    {
        // Only the first retry will count as a failure.
        if (_retries == 0)
            this.State.RecordFailure();

        if (e.GetException() is ConsumeException consume)
        {
            if (consume.Error.IsFatal)
                this.Listener.Stop();
        }
    }

    /// <summary>
    /// The Kafka consumer has stopped which means we need to also cancel the background task associated with it.
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void ListenerStopHandler(object sender, EventArgs e)
    {
        if (_consumer != null &&
            !_notRunning.Contains(_consumer.Status) &&
            _cancelToken != null && !_cancelToken.IsCancellationRequested)
        {
            _cancelToken.Cancel();
        }
    }

    /// <summary>
    /// Retrieve a file from storage and send to Microsoft Cognitive Services. Obtain
    /// the report and update the content record accordingly.
    /// </summary>
    /// <param name="result"></param>
    /// <returns></returns>
    private async Task HandleMessageAsync(ConsumeResult<string, ReportRequestModel> result)
    {
        try
        {
            // The service has stopped, so to should consuming messages.
            if (this.State.Status != ServiceStatus.Running)
            {
                this.Listener.Stop();
                this.State.Stop();
            }
            else
            {
                await ProcessReportAsync(result);

                // Inform Kafka this message is completed.
                this.Listener.Commit(result);
                this.Listener.Resume();

                // Successful run clears any errors.
                this.State.ResetFailures();
                _retries = 0;
            }
        }
        catch (Exception ex)
        {
            if (ex is HttpClientRequestException httpEx)
            {
                this.Logger.LogError(ex, "HTTP exception while consuming. {response}", httpEx.Data["body"] ?? "");
            }
            else
            {
                this.Logger.LogError(ex, "Failed to handle message");
            }
            ListenerErrorHandler(this, new ErrorEventArgs(ex));
        }
        finally
        {
            if (State.Status == ServiceStatus.Running) Listener.Resume();
        }
    }

    /// <summary>
    /// Process the report request.
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    private async Task ProcessReportAsync(ConsumeResult<string, ReportRequestModel> result)
    {
        var request = result.Message.Value;
        if (request.Destination.HasFlag(ReportDestination.ReportingService))
        {
            if (request.ReportType == Entities.ReportType.Content)
            {
                if (request.ReportInstanceId.HasValue)
                {
                    var instance = await this.Api.GetReportInstanceAsync(request.ReportInstanceId.Value);
                    if (instance != null)
                    {
                        await GenerateReportAsync(request, instance);
                    }
                    else
                        this.Logger.LogWarning("Report instance does not exist.  Report Instance: {instance}", request.ReportInstanceId);
                }
                else
                {
                    var report = await this.Api.GetReportAsync(request.ReportId);
                    if (report != null)
                    {
                        await GenerateReportAsync(request, report);
                    }
                    else
                        this.Logger.LogWarning("Report does not exist.  Report: {report}", request.ReportId);
                }
            }
            else if (request.ReportType == Entities.ReportType.AVOverview)
            {
                var instance = await this.Api.GetAVOverviewInstanceAsync(request.ReportId);
                if (instance != null)
                {
                    await GenerateReportAsync(request, instance);
                }
                else
                    this.Logger.LogWarning("AV overview instance does not exist.  Instance: {report}", request.ReportId);
            }
            else throw new NotImplementedException($"Report template type '{request.ReportType.GetName()}' has not been implemented");
        }
    }

    /// <summary>
    /// Send out an email for the specified report.
    /// Generate a report instance for this email.
    /// Send an email merge to CHES.
    /// This will send out a separate email to each context provided.
    /// </summary>
    /// <param name="request"></param>
    /// <param name="report"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    private async Task GenerateReportAsync(ReportRequestModel request, API.Areas.Services.Models.Report.ReportModel report)
    {
        // Fetch content for every section within the report.  This will include folders and filters.
        var sections = report.Sections.Select(s => new ReportSectionModel(s));
        var searchResults = await this.Api.FindContentForReportIdAsync(report.Id);
        var sectionContent = sections.ToDictionary(s => s.Name, section =>
        {
            if (searchResults.TryGetValue(section.Name, out SearchResultModel<TNO.API.Areas.Services.Models.Content.ContentModel>? results))
            {
                section.Content = results.Hits.Hits.Select(h => new ContentModel(h.Source)).ToArray();
            }
            return section;
        });

        // Fetch all image data.  Need to do this in a separate step because of async+await.
        // TODO: Review this implementation due to performance issues.
        foreach (var section in sectionContent)
        {
            foreach (var content in section.Value.Content.Where(c => c.ContentType == Entities.ContentType.Image))
            {
                content.ImageContent = await this.Api.GetImageFile(content.Id);
            }
        }

        var to = report.Subscribers.Where(s => !String.IsNullOrWhiteSpace(s.User?.Email)).Select(s => s.User!.Email).ToArray();
        var subject = await this.ReportEngine.GenerateReportSubjectAsync(report, sectionContent, request.UpdateCache);
        var body = await this.ReportEngine.GenerateReportBodyAsync(report, sectionContent, null, request.UpdateCache);

        // Save the report instance.
        // Group content by the section name.
        var instance = new ReportInstance(report.Id, request.RequestorId, sectionContent.SelectMany(s => s.Value.Content.Select(c => new ReportInstanceContent(0, c.Id, s.Key, c.SortOrder))))
        {
            OwnerId = request.RequestorId,
            PublishedOn = DateTime.UtcNow
        };
        var instanceModel = await this.Api.AddReportInstanceAsync(new API.Areas.Services.Models.ReportInstance.ReportInstanceModel(instance, _serializationOptions))
            ?? throw new InvalidOperationException("Report instance failed to be returned by API");

        // Send the email.
        var response = await SendEmailAsync(request, to, subject, body, $"{report.Name}-{report.Id}");

        // Save the report instance.
        // Group content by the section name.
        instance.Id = instanceModel.Id;
        instance.Version = instanceModel.Version ?? 0;
        instance.Response = JsonDocument.Parse(JsonSerializer.Serialize(response, _serializationOptions));
        await this.Api.UpdateReportInstanceAsync(new API.Areas.Services.Models.ReportInstance.ReportInstanceModel(instance, _serializationOptions));
    }

    /// <summary>
    /// Send out an email for the specified report.
    /// Generate a report instance for this email.
    /// Send an email merge to CHES.
    /// This will send out a separate email to each context provided.
    /// </summary>
    /// <param name="request"></param>
    /// <param name="instance"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    private async Task GenerateReportAsync(ReportRequestModel request, API.Areas.Services.Models.AVOverview.AVOverviewInstanceModel instance)
    {
        var model = new AVOverviewInstanceModel(instance);
        var template = instance.Template ?? throw new InvalidOperationException($"Report template was not included in model.");

        var to = instance.Subscribers.Where(s => !String.IsNullOrWhiteSpace(s.Email)).Select(s => s.Email).ToArray();
        // No need to send an email if there are no subscribers.
        if (to.Length > 0)
        {
            var subject = await this.ReportEngine.GenerateReportSubjectAsync(template, model, request.UpdateCache);
            var body = await this.ReportEngine.GenerateReportBodyAsync(template, model, request.UpdateCache);

            // Send the email.
            var response = await SendEmailAsync(request, to, subject, body, $"{instance.TemplateType}-{instance.Id}");

            // Update the report instance with the email response.
            instance.Response = JsonDocument.Parse(JsonSerializer.Serialize(response, _serializationOptions));
            instance.IsPublished = true;
            await this.Api.UpdateAVOverviewInstanceAsync(instance);
        }
        else
        {
            this.Logger.LogWarning($"AV evening overview has no subscribers.");
        }
    }

    /// <summary>
    /// Send out an email for the specified report instance.
    /// Send an email merge to CHES.
    /// This will send out a separate email to each context provided.
    /// </summary>
    /// <param name="request"></param>
    /// <param name="reportInstance"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentException"></exception>
    private async Task GenerateReportAsync(ReportRequestModel request, API.Areas.Services.Models.ReportInstance.ReportInstanceModel reportInstance)
    {
        // TODO: Control when a report is sent through configuration.
        var report = reportInstance.Report ?? throw new ArgumentException("Report instance must include the report model.");
        var sections = report.Sections.Select(s => new ReportSectionModel(s));
        var searchResults = await this.Api.GetContentForReportInstanceIdAsync(reportInstance.Id);
        var sectionContent = searchResults.GroupBy(r => r.SectionName).ToDictionary(r => r.Key, r =>
        {
            var section = sections.FirstOrDefault(s => s.Name == r.Key) ?? throw new InvalidOperationException("Unable to find matching section in report");
            section.Content = r.Where(ri => ri.Content != null).Select(ri => new ContentModel(ri.Content!, ri.SortOrder)).ToArray();
            return section;
        });

        // Fetch all image data.  Need to do this in a separate step because of async+await.
        // TODO: Review this implementation due to performance issues.
        foreach (var section in sectionContent)
        {
            foreach (var content in section.Value.Content.Where(c => c.ContentType == Entities.ContentType.Image))
            {
                content.ImageContent = await this.Api.GetImageFile(content.Id);
            }
        }

        var to = report.Subscribers.Where(s => !String.IsNullOrWhiteSpace(s.User?.Email)).Select(s => s.User!.Email).ToArray();
        var subject = await this.ReportEngine.GenerateReportSubjectAsync(reportInstance.Report, sectionContent, request.UpdateCache);
        var body = await this.ReportEngine.GenerateReportBodyAsync(reportInstance.Report, sectionContent, null, request.UpdateCache);

        // Send the email.
        var response = await SendEmailAsync(request, to, subject, body, $"{report.Name}-{report.Id}");

        // Update the report instance.
        var json = JsonDocument.Parse(JsonSerializer.Serialize(response, _serializationOptions));
        if (reportInstance.PublishedOn == null) reportInstance.PublishedOn = DateTime.UtcNow;
        reportInstance.Response = JsonSerializer.Deserialize<Dictionary<string, object>>(json, _serializationOptions) ?? new Dictionary<string, object>();
        await this.Api.UpdateReportInstanceAsync(reportInstance);
    }

    /// <summary>
    /// Send an email to CHES.
    /// </summary>
    /// <param name="request"></param>
    /// <param name="to"></param>
    /// <param name="subject"></param>
    /// <param name="body"></param>
    /// <param name="tag"></param>
    /// <returns></returns>
    private async Task<EmailResponseModel?> SendEmailAsync(ReportRequestModel request, IEnumerable<string> to, string subject, string body, string tag)
    {
        await HandleChesEmailOverrideAsync(request.RequestorId);

        var contexts = new List<EmailContextModel>();
        if (!String.IsNullOrWhiteSpace(request.To))
        {
            // Add a context for the requested list of users.
            var another = request.To.Split(",").Select(v => v.Trim());
            contexts.Add(new EmailContextModel(another, new Dictionary<string, object>(), DateTime.Now)
            {
                Tag = tag,
            });
        }
        else
        {
            contexts.AddRange(to.Select(v => new EmailContextModel(new[] { v }, new Dictionary<string, object>(), DateTime.Now)
            {
                Tag = tag,
            }).ToList());
        }

        var merge = new EmailMergeModel(this.ChesOptions.From, contexts, subject, body)
        {
            // TODO: Extract values from report settings.
            Encoding = EmailEncodings.Utf8,
            BodyType = EmailBodyTypes.Html,
            Priority = EmailPriorities.Normal,
        };

        var response = await this.Ches.SendEmailAsync(merge);
        this.Logger.LogInformation("Report sent to CHES.  Report: {report}", request.ReportId);

        return response;
    }

    /// <summary>
    /// If CHES has been configured to send emails to the user we need to provide an appropriate user.
    /// </summary>
    /// <param name="requestorId"></param>
    /// <exception cref="InvalidOperationException"></exception>
    private async Task HandleChesEmailOverrideAsync(int? requestorId)
    {
        // The requestor becomes the current user.
        var email = this.ChesOptions.OverrideTo ?? "";
        if (requestorId.HasValue)
        {
            var user = await this.Api.GetUserAsync(requestorId.Value);
            if (user != null) email = user.Email;
        }
        var identity = _user.Identity as ClaimsIdentity ?? throw new ConfigurationException("CHES requires an active ClaimsPrincipal");
        identity.RemoveClaim(_user.FindFirst(ClaimTypes.Email));
        identity.AddClaim(new Claim(ClaimTypes.Email, email));
    }
    #endregion
}
