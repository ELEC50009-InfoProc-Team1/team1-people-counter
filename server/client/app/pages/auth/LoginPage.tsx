import { RefreshRounded, WarningRounded } from "@mui/icons-material";
import { Alert, Button, CircularProgress, Stack, Typography, Link as MUILink, Divider, alpha } from "@mui/material";
import { useEffect, useState, type PropsWithChildren, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { APIManager, type AuthMethod } from "~/managers/APIManager";
import config from "../../../config/config.json";
import { Link, useSearchParams } from "react-router";
import { interleave } from "~/util/interleave";
import { LocalLogin } from "~/components/auth/LocalLogin";
import { grey } from "~/theme/theme";

export const LoginPage = (): ReactNode => {
    const [allowedMethods, setAllowedMethods] = useState<AuthMethod[]>();
    const [methodLoadError, setMethodLoadError] = useState<any>();
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [accountRequestsOpen, setAccountRequestsOpen] = useState(false);
    const [loadingAccountRequestsOpen, setLoadingAccountRequestsOpen] = useState(true);

    const { t } = useTranslation();

    const attemptLoad = () => {
        APIManager.Auth.getLoginTypes().then(types => {
            if (types?.length) {
                setAllowedMethods(types);
            } else {
                setMethodLoadError("noconfigset");
            }
        }).catch(e => {
            setMethodLoadError(e);
        }).finally(() => {
            setLoadingMethods(false);
        });

        APIManager.Auth.getAccountRegistrationOpen().then(open => {
            if (open) setAccountRequestsOpen(open);
        }).finally(() => {
            setLoadingAccountRequestsOpen(false);
        });
    };

    const resetState = () => {
        setAllowedMethods(undefined);
        setMethodLoadError(undefined);
        setLoadingMethods(true);
        setAccountRequestsOpen(false);
        setLoadingAccountRequestsOpen(true);
    };

    useEffect(() => {
        attemptLoad();
    }, []);

    const isLoading = loadingMethods || loadingAccountRequestsOpen;

    if (isLoading) {
        return (
            <Stack
                direction="row"
                justifyContent="center"
            >
                {loadingMethods ? "1" : "0"}
                <CircularProgress />
            </Stack>
        );
    }

    if (methodLoadError) {
        return (
            <Stack
                direction="column"
                gap={2}
            >
                <Alert
                    icon={<WarningRounded fontSize="inherit" />}
                    variant="filled"
                    severity="error"
                >
                    <Typography
                        variant="subtitle2"
                    >
                        {t("auth.cant-load-login")}
                    </Typography>
                    <Typography
                        sx={{
                            whiteSpace: "pre-line"
                        }}
                    >
                        {t("auth.cant-load-login-details", { admin: config.contact?.admin || t("common:contact.admin-fallback") })}

                    </Typography>
                </Alert>
                <Button
                    size="medium"
                    color="primary"
                    variant="outlined"
                    startIcon={
                        <RefreshRounded />
                    }
                    onClick={() => {
                        resetState();
                        attemptLoad();
                    }}
                >
                    {t("common:navigation.retry")}
                </Button>
            </Stack>
        );
    }

    return (
        <Stack
            gap={4}
        >
            <Stack
                gap={1}
            >
                <Typography
                    component="h1"
                    variant="h3"
                >
                    {t("auth.sign-in")}
                </Typography>
                {
                    accountRequestsOpen ?
                        <Typography
                            component="div"
                            color="textDisabled"
                        >
                            {t("auth.dont-have-an-account")}{" "}
                            <MUILink
                                component={Link}
                                to="/signup"
                                color="inherit"
                            >
                                {t("auth.request-account-here")}
                            </MUILink>
                        </Typography>
                        : null
                }
            </Stack>
            {
                interleave([...new Set(allowedMethods)].map((x): ReactNode => {
                    switch (x) {
                        case "local":
                            return (
                                <LoginErrorAlert method={x} key={x}>
                                    <LocalLogin />
                                </LoginErrorAlert>
                            );
                        default:
                            return (
                                <LoginErrorAlert method={x} key={x}>
                                    <Alert
                                        severity="warning"
                                        variant="filled"
                                    >
                                        {t("auth.unsupported-authentication-method")}: {x}
                                    </Alert>
                                </LoginErrorAlert>
                            );
                    }
                }), <Divider>{t("auth.or")}</Divider>)
            }
        </Stack>
    );
};

const LoginErrorAlert = ({ method, children }: PropsWithChildren<{ method: AuthMethod; }>): ReactNode => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    return (
        <Stack
            gap={1}
        >
            {children}
            {
                searchParams.get("error") == method ?
                    <Alert
                        variant="filled"
                        severity="error"
                    >
                        <div>
                            {t("auth.login-error")}
                        </div>
                        <Typography
                            sx={theme => ({
                                color: alpha(grey[50], 0.7),
                                ...theme.applyStyles("dark", {
                                    color: (theme.vars || theme).palette.text.disabled
                                })
                            })}
                        >
                            {searchParams.get("errorMessage") || t("auth.generic-login-error-descriptor")}
                        </Typography>
                    </Alert>
                    :
                    null
            }
        </Stack>
    );
};
