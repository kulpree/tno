using Microsoft.Extensions.Primitives;
using TNO.Core.Extensions;
using TNO.Entities;

namespace TNO.DAL.Models;

/// <summary>
/// ContentFilter class, provides a model for searching content.
/// </summary>
public class ContentFilter : PageFilter
{
    #region Properties
    /// <summary>
    /// get/set - Only include content with this status.
    /// </summary>
    public ContentStatus? Status { get; set; }

    /// <summary>
    /// get/set - Only include content with this product.
    /// </summary>
    public string? Product { get; set; }

    /// <summary>
    /// get/set - Only include content with this product.
    /// </summary>
    public int? ProductId { get; set; }

    /// <summary>
    /// get/set - Only include content with this these types.
    /// </summary>
    public ContentType[] ContentTypes { get; set; } = Array.Empty<ContentType>();

    /// <summary>
    /// get/set - Only include content owned by this user.
    /// </summary>
    public int? OwnerId { get; set; }

    /// <summary>
    /// get/set - Only include content created or updated by this user.
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// get/set - An array of source IDs.
    /// </summary>
    public long[] SourceIds { get; set; } = Array.Empty<long>();

    /// <summary>
    /// get/set - Only include content with this other source.
    /// </summary>
    public string? OtherSource { get; set; }

    /// <summary>
    /// get/set - Only include content with this headline.
    /// </summary>
    public string? Headline { get; set; }

    /// <summary>
    /// get/set - Only include content with this page name.
    /// </summary>
    public string? PageName { get; set; }

    /// <summary>
    /// get/set - Only include content created on this date.
    /// </summary>
    public DateTime? CreatedOn { get; set; }

    /// <summary>
    /// get/set - Only include content created on or after this date.
    /// </summary>
    public DateTime? CreatedStartOn { get; set; }

    /// <summary>
    /// get/set - Only included content created on or before this date.
    /// </summary>
    public DateTime? CreatedEndOn { get; set; }

    /// <summary>
    /// get/set - Only include content updated on this date.
    /// </summary>
    public DateTime? UpdatedOn { get; set; }

    /// <summary>
    /// get/set - Only include content updated on or after this date.
    /// </summary>
    public DateTime? UpdatedStartOn { get; set; }

    /// <summary>
    /// get/set - Only include content updated on or before this date.
    /// </summary>
    public DateTime? UpdatedEndOn { get; set; }

    /// <summary>
    /// get/set - Only include content published on this date.
    /// </summary>
    public DateTime? PublishedOn { get; set; }

    /// <summary>
    /// get/set - Only include content published on or after this date.
    /// </summary>
    public DateTime? PublishedStartOn { get; set; }

    /// <summary>
    /// get/set - Only include content published on or before this date.
    /// </summary>
    public DateTime? PublishedEndOn { get; set; }

    /// <summary>
    /// get/set - Only include content with the section.
    /// </summary>
    public string? Section { get; set; }

    /// <summary>
    /// get/set - Only include content with the edition.
    /// </summary>
    public string? Edition { get; set; }

    /// <summary>
    /// get/set - Only include content with the byline.
    /// </summary>
    public string? Byline { get; set; }

    /// <summary>
    /// get/set - Only include content with a topic.
    /// </summary>
    public bool? HasTopic { get; set; }

    /// <summary>
    /// get/set - Whether to include hidden content.
    /// </summary>
    public bool? IncludeHidden { get; set; }

    /// <summary>
    /// get/set - Whether to only return hidden content.
    /// </summary>
    public bool? OnlyHidden { get; set; }

    /// <summary>
    /// get/set - Whether to only included published or publishing content.
    /// </summary>
    public bool? OnlyPublished { get; set; }

    /// <summary>
    /// get/set - Get/set the keyword to search for.
    /// </summary>
    public string? Keyword { get; set; }

    // get/set - Get/set the names to search for (tied to ministers).
    public string? Names { get; set; }

    // get/set - Get/set the aliases to search for (tied to ministers).
    public string? Aliases { get; set; }

    /// <summary>
    /// get/set - Get/set the source ids to exlude from the search.
    /// </summary>
    public int[] ExcludeSourceIds { get; set; } = Array.Empty<int>();

    /// <summary>
    /// get/set - An array of content IDs.
    /// </summary>
    public long[] ContentIds { get; set; } = Array.Empty<long>();

    /// <summary>
    /// get/set - An array of content IDs.
    /// </summary>
    public long[] ProductIds { get; set; } = Array.Empty<long>();

    /// <summary>
    /// get/set - Only include content with the specified actions.
    /// </summary>
    public string[] Actions { get; set; } = Array.Empty<string>();

    /// <summary>
    /// get/set - Sort the content in the specified order.
    /// </summary>
    public string[] Sort { get; set; } = Array.Empty<string>();

    /// <summary>
    /// get/set - The content sentitment.
    /// </summary>
    public int[] Sentiment { get; set; } = Array.Empty<int>();

    /// <summary>
    /// get/set - The story text to search for.
    /// </summary>
    public string? StoryText { get; set; }
    #endregion

    #region Constructors
    public ContentFilter() { }

    public ContentFilter(Dictionary<string, StringValues> queryParams) : base(queryParams)
    {
        var filter = new Dictionary<string, StringValues>(queryParams, StringComparer.OrdinalIgnoreCase);

        this.Product = filter.GetStringValue(nameof(this.Product));
        this.OtherSource = filter.GetStringValue(nameof(this.OtherSource));
        this.Headline = filter.GetStringValue(nameof(this.Headline));
        this.Section = filter.GetStringValue(nameof(this.Section));
        this.Keyword = filter.GetStringValue(nameof(this.Keyword));
        this.Names = filter.GetStringValue(nameof(this.Names));
        this.PageName = filter.GetStringValue(nameof(this.PageName));
        this.Edition = filter.GetStringValue(nameof(this.Edition));
        this.Byline = filter.GetStringValue(nameof(this.Byline));
        this.StoryText = filter.GetStringValue(nameof(this.StoryText));

        this.Status = filter.GetEnumNullValue<ContentStatus>(nameof(this.Status));

        this.HasTopic = filter.GetBoolNullValue(nameof(this.HasTopic));
        this.IncludeHidden = filter.GetBoolNullValue(nameof(this.IncludeHidden));
        this.OnlyHidden = filter.GetBoolNullValue(nameof(this.OnlyHidden));
        this.OnlyPublished = filter.GetBoolNullValue(nameof(this.OnlyPublished));

        this.ProductId = filter.GetIntNullValue(nameof(this.ProductId));
        this.OwnerId = filter.GetIntNullValue(nameof(this.OwnerId));
        this.UserId = filter.GetIntNullValue(nameof(this.UserId));

        var quantity = filter.GetIntNullValue(nameof(Quantity));
        if (quantity.HasValue) Quantity = quantity.Value;

        this.CreatedOn = filter.GetDateTimeNullValue(nameof(this.CreatedOn));
        this.CreatedStartOn = filter.GetDateTimeNullValue(nameof(this.CreatedStartOn));
        this.CreatedEndOn = filter.GetDateTimeNullValue(nameof(this.CreatedEndOn));
        this.UpdatedOn = filter.GetDateTimeNullValue(nameof(this.UpdatedOn));
        this.UpdatedStartOn = filter.GetDateTimeNullValue(nameof(this.UpdatedStartOn));
        this.UpdatedEndOn = filter.GetDateTimeNullValue(nameof(this.UpdatedEndOn));
        this.PublishedOn = filter.GetDateTimeNullValue(nameof(this.PublishedOn));
        this.PublishedStartOn = filter.GetDateTimeNullValue(nameof(this.PublishedStartOn));
        this.PublishedEndOn = filter.GetDateTimeNullValue(nameof(this.PublishedEndOn));

        this.ContentTypes = filter.GetEnumArrayValue<ContentType>(nameof(this.ContentTypes));
        this.ContentIds = filter.GetLongArrayValue(nameof(this.ContentIds));
        this.ProductIds = filter.GetLongArrayValue(nameof(this.ProductIds));
        this.SourceIds = filter.GetLongArrayValue(nameof(this.SourceIds));
        this.Sentiment = filter.GetIntArrayValue(nameof(this.Sentiment));
        this.ExcludeSourceIds = filter.GetIntArrayValue(nameof(this.ExcludeSourceIds));
        this.Actions = filter.GetStringArrayValue(nameof(this.Actions));
        this.Sort = filter.GetStringArrayValue(nameof(this.Sort));
    }
    #endregion
}
