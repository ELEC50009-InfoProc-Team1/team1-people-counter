import { ArrowBackRounded, WarningRounded } from "@mui/icons-material";
import { Alert, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AuthPageStyle } from "~/components/auth/AuthPageStyle";
import config from "../../../config/config.json";

export const ErrorCatchAllHTTPPage = ({ code }: { code: number; }): ReactNode => {
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
                        severity="warning"
                        icon={
                            <WarningRounded />
                        }
                    >
                        <Typography
                            variant="h5"
                        >
                            {code}
                        </Typography>
                        <ErrorMessage
                            code={code}
                        />
                    </Alert>
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
                </Stack>
            </AuthPageStyle>
        </>
    );
};

const ErrorMessage = ({ code }: { code: number; }): ReactNode => {
    const { t } = useTranslation();

    let message = t("http.status.fallback", { admin: config.contact?.admin || t("common:contact.admin-fallback") });

    switch (code) {
        case 400:
            message = t("http.status.400");
            break;
        case 401:
            message = t("http.status.401");
            break;
        case 403:
            message = t("http.status.403");
            break;
        case 404:
            message = t("http.status.404");
            break;
        case 418:
            message = t("http.status.418");
            break;
        case 500:
            message = t("http.status.500", { admin: config.contact?.admin || t("common:contact.admin-fallback") });
            break;
    }

    return (
        <Typography
            whiteSpace="pre-line"
        >
            {message}
        </Typography>
    );
};
