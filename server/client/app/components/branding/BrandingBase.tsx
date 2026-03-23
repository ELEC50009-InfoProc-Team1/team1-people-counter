import Stack, { type StackProps } from "@mui/material/Stack";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export interface BrandingBaseProps {
    noText?: boolean;
    noImage?: boolean;
    text?: string;
    src: string;
}

const spacing: number = 2;

export const BrandingBase = ({ noText, noImage, src, text, sx, ...other }: BrandingBaseProps & StackProps): ReactNode => {
    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={[
                {
                    pointerEvents: "none",
                    userSelect: "none"
                },
                ...(Array.isArray(sx) ? sx : [sx])
            ]}
            {...other}
        >
            {
                !noImage ?
                    <Box
                        sx={
                            theme => ({
                                p: theme.spacing(spacing),
                                height: 64
                            })
                        }
                    >
                        <img
                            src={src}
                            style={{
                                width: "32px"
                            }}
                        />
                    </Box>
                    : null
            }
            {
                !noText ?
                    <Typography
                        variant="h2"
                        sx={theme => ({
                            pr: !noImage ? theme.spacing(spacing) : undefined,
                            fontSize: 24
                        })}
                    >
                        {text}
                    </Typography>
                    : null
            }
        </Stack >
    );
};

export const BrandingBasePaper = (props: BrandingBaseProps): ReactNode => {
    return (
        <Paper
            variant="outlined"
            sx={{
                width: "fit-content",
                height: "fit-content"
            }}
        >
            <BrandingBase
                {...props}
            />
        </Paper>
    );
};
