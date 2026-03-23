import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BrandingBase, BrandingBasePaper } from "./BrandingBase";

const logo = "/favicon.ico";
import { Pulse } from "../animation/Pulse";

export const PeopleCounter = ({ noText }: { noText?: boolean; }): ReactNode => {
    const { t } = useTranslation();

    return (
        <BrandingBase
            src={logo}
            noText={noText}
            text={t("branding:peoplecounter")}
        />
    );
};

export const PeopleCounterPaper = ({ noText }: { noText?: boolean; }): ReactNode => {
    const { t } = useTranslation();

    return (
        <BrandingBasePaper
            src={logo}
            noText={noText}
            text={t("branding:peoplecounter")}
        />
    );
};

export const PeopleCounterDOM = ({ width = 256 }: { width?: number; }): ReactNode => {
    const holeRadius = 0.25;

    return (
        <div
            style={{
                width: width,
                aspectRatio: "1"
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        position: "absolute",
                        borderRadius: "50%",
                        background: "linear-gradient(43deg, #8f74d5 0%, #ffd273 100%)",
                        clipPath: "circle(100% at 50% 50%)",
                        mask: `radial-gradient(${width * holeRadius}px, #0000 calc(100% - 1px), #000)`
                    }}
                />
            </div>
        </div>
    );
};

export const PeopleCoutnerLoading = ({ width = 256 }: { width?: number; }): ReactNode => {
    return (
        <div
            style={{
                "--Pulse-visible": "rgba(255, 187, 155, 0.7)",
                "--Pulse-invisible": "rgba(255, 187, 155, 0)",
                "--Pulse-full-visible": "rgba(255, 187, 155, 1)",
                "--Pulse-distance": `${0.06 * width}px`,
                width: width
            } as CSSProperties}
        >
            <Pulse
                style={{
                    maxWidth: "256px",
                    width: `${width}px`,
                    borderRadius: "50%"
                }}
            >
                <PeopleCounterDOM
                    width={width}
                />
            </Pulse>
        </div>
    );
};
