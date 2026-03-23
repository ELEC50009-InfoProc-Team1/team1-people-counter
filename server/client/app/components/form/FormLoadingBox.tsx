import { Box, LinearProgress, Stack } from "@mui/material";
import type { ReactNode } from "react";

export const FormLoadingBox = ({ show }: { show: boolean; }): ReactNode => {
    return (
        <Box
            sx={theme => ({
                position: "absolute",
                top: `calc(${(theme.vars || theme).shape.borderRadius} * -1)`,
                left: `calc(${(theme.vars || theme).shape.borderRadius} * -1)`,
                width: `calc(100% + (2 * ${(theme.vars || theme).shape.borderRadius}))`,
                height: `calc(100% + (2 * ${(theme.vars || theme).shape.borderRadius}))`,
                background: (theme.vars || theme).palette.background.default,
                zIndex: 1,
                opacity: show ? 0.8 : 0,
                borderRadius: (theme.vars || theme).shape.borderRadius,
                pointerEvents: "none",
                transition: "opacity 0.2s"
            })}
        >
            <Stack
                justifyContent="center"
                alignItems="center"
                sx={{
                    width: "80%",
                    mx: "auto",
                    height: "100%"
                }}
            >
                <Box
                    width={1}
                >
                    <LinearProgress />
                </Box>
            </Stack>
        </Box>
    );
};
