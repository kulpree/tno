using System.Text.Json;
using TNO.Models.Extensions;

namespace TNO.API.Models.Settings;

public class ReportTemplateSettingsModel
{
    #region Properties
    #endregion

    #region Constructors
    public ReportTemplateSettingsModel() { }

    public ReportTemplateSettingsModel(Dictionary<string, object> settings, JsonSerializerOptions options)
    {
        // this.EnableSummaryCharts = settings.GetDictionaryJsonValue<bool>("enableSummaryCharts", false, options)!;
        // this.EnableSectionCharts = settings.GetDictionaryJsonValue<bool>("enableSectionCharts", false, options)!;
    }
    #endregion
}
