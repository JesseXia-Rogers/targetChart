import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    XAxisSettings: XAxisSettings;
    YAxisSettings: YAxisSettings;
    DataLabelSettings: DataLabelSettings;
    GrowthSettings: GrowthSettings;
    LayoutSettings: LayoutSettings;
    BarSettings: BarSettings;
    DataColors: DataColors;
    LegendSettings: LegendSettings;
    PrimaryLabelSettings: PrimaryLabelSettings;
    PrimaryLineSettings: PrimaryLineSettings;
    SecondaryLabelSettings: SecondaryLabelSettings;
    SecondaryLineSettings: SecondaryLineSettings;
}
export declare class LayoutSettings {
    ChartXMargin: number;
    ChartYMargin: number;
    XAxisBarWhiteSpace: number;
    YScaleFactor: number;
}
export declare class BarSettings {
    BarAlignment: string;
    BarPadding: number;
    BarBorder: boolean;
    BarBorderSize: number;
    BarBorderColor: string;
}
export declare class XAxisSettings {
    FontFamily: string;
    FontColor: string;
    FontSize: number;
    LabelAngle: number;
    XOffset: number;
    YOffset: number;
}
export declare class YAxisSettings {
    DisplayUnits: string;
    MaxValue: number;
    TickCount: number;
    ToggleGridLines: boolean;
    FontFamily: string;
    FontColor: string;
    FontSize: number;
}
export declare class DataColors {
    seriesFontColor: string;
    seriesColor: string;
}
export declare class DataLabelSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    FontFamily: string;
    SumLabelFontSize: number;
    SumLabelColor: string;
    SumLabelBackgroundColor: string;
    SumLabelDisplayTolerance: number;
    SumLabelToggle: boolean;
    SumLabelBgToggle: boolean;
    BarLabelToggle: boolean;
    BarLabelColor: string;
    BarLabelFontSize: number;
    BarLabelDisplayTolerance: number;
}
export declare class LegendSettings {
    LegendToggle: boolean;
    LegendPosition: string;
    LegendMargin: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
}
export declare class GrowthSettings {
    TogglePrimaryIndicators: boolean;
    ToggleSecondaryIndicator: boolean;
    PrimarySelector: string;
    SecondarySelector: string;
}
export declare class PrimaryLabelSettings {
    LabelBackgroundColor: string;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    BorderColor: string;
    BorderSize: number;
    LabelOffsetHeight: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ShowSign: boolean;
    ToggleBgShape: boolean;
}
export declare class PrimaryLineSettings {
    AlignIndicators: boolean;
    LineColor: string;
    LineOffsetHeight: number;
    LineSize: number;
    ArrowSize: number;
    DisplayArrow: string;
}
export declare class SecondaryLabelSettings {
    DisplaySide: string;
    xOffset: number;
    LabelBackgroundColor: string;
    BorderColor: string;
    BorderSize: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ShowSign: boolean;
    ToggleBgShape: boolean;
}
export declare class SecondaryLineSettings {
    LineColor: string;
    LineType: string;
    LineSize: number;
    ArrowSize: number;
    DisplayArrow: string;
}
