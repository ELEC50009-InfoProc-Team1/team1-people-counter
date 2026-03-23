import { useEffect, useState, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router";
import { APIManager, type UserObject } from "~/managers/APIManager";
import { AuthGuardUserContext } from "../context/AuthGuardUserContext";

export default function AuthGuardLayout(): ReactNode {
    const [me, setMe] = useState<UserObject | undefined>();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        APIManager.User.me().then(x => {
            setMe(x);
            if (!x) {
                return navigate("/login");
            }
            setLoading(false);
        }).catch(() => {
            navigate("/login");
        });
    }, []);

    if (loading || !me) {
        return (
            <></>
        );
    }

    return (
        <AuthGuardUserContext
            value={{
                me: me,
                setMe: setMe
            }}
        >
            <Outlet />
        </AuthGuardUserContext>
    );
}
