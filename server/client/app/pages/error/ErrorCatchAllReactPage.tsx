import { ArrowBackRounded, ErrorRounded } from "@mui/icons-material";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AuthPageStyle } from "~/components/auth/AuthPageStyle";

export const ErrorCatchAllReactPage = ({ err }: { err: any; }): ReactNode => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
            <title>error - people counter</title>
            <AuthPageStyle>
                <Stack
                    gap={2}
                >
                    <Alert
                        variant="outlined"
                        severity="error"
                        icon={
                            <ErrorRounded />
                        }
                    >
                        <Typography
                            variant="h5"
                        >
                            {t("react.frontend-error")}
                        </Typography>
                        <Typography>
                            {t("react.frontend-error-details")}
                        </Typography>
                    </Alert>
                </Stack>


                <Stack
                    direction="row"
                    justifyContent="start"
                >
                    <Button
                        onClick={e => {
                            e.preventDefault();
                            navigate(-1);
                        }}
                        variant="outlined"
                        startIcon={
                            <ArrowBackRounded />
                        }
                    >
                        {t("common:navigation.go-back")}
                    </Button>
                </Stack>

                <Paper
                    sx={{
                        width: 1,
                        overflow: "auto",
                        mt: 4
                    }}
                >
                    <code>
                        <pre
                            style={{
                                margin: 0,
                                padding: "24px"
                            }}
                        >
                            {err.stack}
                        </pre>
                    </code>
                </Paper>
            </AuthPageStyle>
        </>
    );
};
