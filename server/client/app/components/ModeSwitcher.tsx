import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, type ReactNode } from "react";
import { DarkModeRounded, LightModeOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const ModeSwitcher = ({ onClick, ...other }: IconButtonProps): ReactNode => {
    const { mode, setMode } = useColorScheme();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Tooltip
            title={t("common:mode.switchTo", { mode: t(`common:mode.${mode == "light" ? "dark" : "light"}`) })}
            enterDelay={200}
            arrow
        >
            <IconButton
                aria-label={t("common:mode.toggleAria")}
                size="medium"
                disabled={!mounted}
                onClick={e => {
                    setMode(mode == "light" ? "dark" : "light");
                    onClick?.(e);
                }}
                {...other}
            >
                {mode == "light" ? <DarkModeRounded /> : <LightModeOutlined />}
            </IconButton>
        </Tooltip>
    );
};
