using System.Security.Claims;
using Microsoft.Extensions.DependencyInjection;
using TNO.Ches;
using TNO.Entities.Validation;
using TNO.Kafka;
using TNO.Kafka.Models;
using TNO.Services.Notification.Config;
using TNO.Services.Runners;
using TNO.TemplateEngine;

namespace TNO.Services.Notification;

/// <summary>
/// NotificationService abstract class, provides a console application that runs service, and an api.
/// The NotificationService is a Kafka consumer which pulls content.
/// </summary>
public class NotificationService : KafkaConsumerService
{
    #region Variables
    #endregion

    #region Properties
    #endregion

    #region Constructors
    /// <summary>
    /// Creates a new instance of a NotificationService object, initializes with arguments.
    /// </summary>
    /// <param name="args"></param>
    public NotificationService(string[] args) : base(args)
    {
    }
    #endregion

    #region Methods
    /// <summary>
    /// Configure dependency injection.
    /// </summary>
    /// <param name="services"></param>
    /// <returns></returns>
    protected override IServiceCollection ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);
        services
            .Configure<NotificationOptions>(this.Configuration.GetSection("Service"))
            .AddTransient<IKafkaListener<string, NotificationRequestModel>, KafkaListener<string, NotificationRequestModel>>()
            .AddTransient<INotificationValidator, NotificationValidator>()
            .AddChesSingletonService(this.Configuration.GetSection("CHES"))
            .AddSingleton(new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Email, "") })))
            .AddScoped<IServiceManager, NotificationManager>()
            .AddTemplateEngine(this.Configuration);

        // TODO: Figure out how to validate without resulting in aggregating the config values.
        // services.AddOptions<NotificationOptions>()
        //     .Bind(this.Configuration.GetSection("Service"))
        //     .ValidateDataAnnotations();

        return services;
    }
    #endregion
}
