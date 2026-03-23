import { useState, type ReactNode, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { FormLoadingBox } from "../form/FormLoadingBox";
import { Button, FormControl, FormLabel, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { LocalAuthManager } from "~/managers/AuthManager";
import { AxiosError } from "axios";

interface FormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement;
    password: HTMLInputElement;
}

interface LocalSignInFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

export const LocalLogin = (): ReactNode => {
    const [showPassword, setShowPassword] = useState(false);
    const [attemptingLogin, setAttemptingLogin] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const loading = attemptingLogin;

    return (
        <form
            style={{
                position: "relative"
            }}

            onSubmit={(e: SubmitEvent<LocalSignInFormElement>) => {
                e.preventDefault();
                const formElements = e.currentTarget.elements;

                let data = {
                    username: formElements.username.value,
                    password: formElements.password.value
                };

                setAttemptingLogin(true);

                // remove login error params
                [
                    "error",
                    "errorMessage"
                ].forEach(x => {
                    if (searchParams.has(x)) searchParams.delete(x);
                });

                setSearchParams(searchParams);

                LocalAuthManager.login(data.username, data.password).then(success => {
                    if (!success) {
                        searchParams.set("error", "local");
                        setSearchParams(searchParams);
                        setAttemptingLogin(false);
                    } else {
                        navigate("/home");
                    }
                }).catch((e: any) => {
                    if (e instanceof AxiosError && e.status == 400) {
                        searchParams.set("error", "local");
                        searchParams.set("errorMessage", t("auth.local.invalid-username-password"));
                        setSearchParams(searchParams);
                    } else {
                        searchParams.set("error", "local");
                        setSearchParams(searchParams);
                    }

                    setAttemptingLogin(false);
                });
            }}
        >
            <FormLoadingBox show={loading} />

            <FormControl
                required
                disabled={loading}
            >
                <FormLabel>{t("auth.local.username")}</FormLabel>
                <OutlinedInput
                    type="text"
                    name="username"
                    autoComplete="username"
                />
            </FormControl>

            <FormControl
                required
                disabled={loading}
            >
                <FormLabel>{t("auth.local.password")}</FormLabel>
                <OutlinedInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    endAdornment={(
                        <InputAdornment
                            position="end"
                        >
                            <IconButton
                                size="large"
                                sx={theme => ({
                                    p: 0,
                                    border: "none",
                                    background: "none!important",
                                    transition: "color 0.2s!important",
                                    color: (theme.vars || theme).palette.text.disabled,
                                    "&:hover": {
                                        color: (theme.vars || theme).palette.text.secondary
                                    }
                                })}
                                onClick={() => {
                                    setShowPassword(!showPassword);
                                }}
                            >
                                {
                                    showPassword ?
                                        <VisibilityRounded />
                                        :
                                        <VisibilityOffRounded />
                                }
                            </IconButton>
                        </InputAdornment>
                    )}
                />
            </FormControl>
            <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                color="secondary"
                sx={{
                    mt: 1
                }}
            >
                {t("auth.local.sign-in-button")}
            </Button>
        </form>
    );
};
