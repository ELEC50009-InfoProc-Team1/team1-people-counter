import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import config from "../../config/config.json";

export type AuthMethod = "local" | "google";
export type UserObject = {
    id: string;
    name?: string;
};

export type RoomObject = {
    id: string;
    name: string;
    floorID: string;
    maxCapacity: number;
    currentNoOfPeople: number;
};

export type OrganisationObject = {
    id: string;
    name: string;
};

export type DepartmentObject = {
    id: string;
    name: string;
    organisationID: string;
};

export type BuildingObject = {
    id: string;
    name: string;
    departmentID: string;
};

export type FloorObject = {
    id: string;
    name: string;
    buildingID: string;
};

export type DoorwayObject = {
    id: string;
    inRoomID?: string;
    outRoomID?: string;
};

export type CameraObject = {
    id: string;
    userID: string;
    name: string;
    location: string;
};

export class APIManager {
    static #axios?: AxiosInstance;
    static #initialised = false;

    /**
     * Initialise the API manager.
     */
    static init() {
        APIManager.#axios = axios.create({
            baseURL: config.apiLocation,
            allowAbsoluteUrls: false,
            timeout: 10000,
            headers: {
                Accept: "application/json"
            },
            withCredentials: true
        });

        APIManager.#initialised = true;
    }

    static async request(data: AxiosRequestConfig<any>): Promise<AxiosResponse<any, any> | undefined> {
        if (!APIManager.#initialised) APIManager.init();
        return await APIManager.#axios?.request(data);
    }

    static async test(): Promise<Object | undefined> {
        try {
            let res = await APIManager.request({
                method: "get",
                url: "/test"
            });

            return res;
        } catch (e) {
            return false;
        }
    }


    static Auth = class {
        /**
         * Check if the user is logged in.
         * @returns Whether the user is logged in.
         */
        static async loggedIn(): Promise<boolean> {
            try {
                await APIManager.request({
                    method: "get",
                    url: "/user/me"
                });

                return true;
            } catch (e) {
                return false;
            }
        }

        /**
         * Get useable login methods.
         * @returns A list of useable login types.
         */
        static async getLoginTypes(): Promise<AuthMethod[] | undefined> {
            let req = await APIManager.request({
                method: "get",
                url: "/auth/methods/login"
            });

            if (req?.data) return req.data;
            else return undefined;
        };

        /**
         * Get useable signup types.
         * @returns A list of useable signup types.
         */
        static async getSignupTypes(): Promise<AuthMethod[] | undefined> {
            let req = await APIManager.request({
                method: "get",
                url: "/auth/methods/signup"
            });

            if (req?.data) return req.data;
            else return undefined;
        };

        /**
         * Check if accounts can currently be made.
         * @returns Whether accounts can currently be made.
         */
        static async getAccountRegistrationOpen(): Promise<boolean | undefined> {
            let req = await APIManager.request({
                method: "get",
                url: "/auth/methods/signup"
            });

            if (req?.data) return Boolean((req.data as AuthMethod[]).length);
            else return undefined;
        };
    };

    static User = class {
        /**
         * Get the current user.
         * @returns The user object if logged in, undefined if not.
         */
        static async me(): Promise<UserObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/user/me"
                });

                if (res) return res.data as UserObject;
                else return undefined;
            } catch {
                return undefined;
            }
        }
    };

    static Room = class {
        static async get(id: string): Promise<RoomObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/room/${id}`
                });

                if (res) return ({
                    id: (res.data as RoomObject).id,
                    name: (res.data as RoomObject).name || "unnamed room",
                    floorID: (res.data as RoomObject).floorID,
                    maxCapacity: (res.data as RoomObject).maxCapacity || 0,
                    currentNoOfPeople: (res.data as RoomObject).currentNoOfPeople || 0,
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, room: RoomObject): Promise<RoomObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/room/${id}`,
                    data: room
                });

                if (res) return ({
                    id: (res.data as RoomObject).id,
                    name: (res.data as RoomObject).name || "unnamed room",
                    floorID: (res.data as RoomObject).floorID,
                    maxCapacity: (res.data as RoomObject).maxCapacity || 0,
                    currentNoOfPeople: (res.data as RoomObject).currentNoOfPeople || 0,
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<RoomObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/room/all"
                });

                if (res) return (res.data.rooms as RoomObject[]);
                else return [];
            } catch {
                return [];
            }
        }

        static async popular(): Promise<{ id: string, name: string, popularity: number, normalisedPopularity: number; }[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/room/popular"
                });

                if (res) return (res.data);
                else return [];
            } catch {
                return [];
            }
        }

        static async stats(id: string): Promise<{ occupancy: number, timestamp: Date; }[] | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/room/${id}/stats`
                });

                if (res) return (res.data.map((x: { occupancy: number, timestamp: number; }) => ({
                    occupancy: x.occupancy || 0,
                    timestamp: new Date(x.timestamp)
                })));
                else return undefined;
            } catch {
                return undefined;
            }
        }
    };

    static Organisation = class {
        static async get(id: string): Promise<OrganisationObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/organisation/${id}`
                });

                if (res) return ({
                    id: (res.data as OrganisationObject).id,
                    name: (res.data as OrganisationObject).name || "unnamed organisation",
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, org: OrganisationObject): Promise<OrganisationObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/organisation/${id}`,
                    data: org
                });

                if (res) return ({
                    id: (res.data as OrganisationObject).id,
                    name: (res.data as OrganisationObject).name || "unnamed organisation",
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<OrganisationObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/organisation/all"
                });

                if (res) return (res.data.organisations as OrganisationObject[]);
                else return [];
            } catch {
                return [];
            }
        }
    };

    static Department = class {
        static async get(id: string): Promise<DepartmentObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/department/${id}`
                });

                if (res) return ({
                    id: (res.data as DepartmentObject).id,
                    name: (res.data as DepartmentObject).name || "unnamed department",
                    organisationID: (res.data as DepartmentObject).organisationID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, dep: DepartmentObject): Promise<DepartmentObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/department/${id}`,
                    data: dep
                });

                if (res) return ({
                    id: (res.data as DepartmentObject).id,
                    name: (res.data as DepartmentObject).name || "unnamed department",
                    organisationID: (res.data as DepartmentObject).organisationID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<DepartmentObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/department/all"
                });

                if (res) return (res.data.departments as DepartmentObject[]);
                else return [];
            } catch {
                return [];
            }
        }
    };

    static Building = class {
        static async get(id: string): Promise<BuildingObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/building/${id}`
                });

                if (res) return ({
                    id: (res.data as BuildingObject).id,
                    name: (res.data as BuildingObject).name || "unnamed building",
                    departmentID: (res.data as BuildingObject).departmentID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, building: BuildingObject): Promise<BuildingObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/building/${id}`,
                    data: building
                });

                if (res) return ({
                    id: (res.data as BuildingObject).id,
                    name: (res.data as BuildingObject).name || "unnamed building",
                    departmentID: (res.data as BuildingObject).departmentID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<BuildingObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/building/all"
                });

                if (res) return (res.data.buildings as BuildingObject[]);
                else return [];
            } catch {
                return [];
            }
        }
    };

    static Floor = class {
        static async get(id: string): Promise<FloorObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/floor/${id}`
                });

                if (res) return ({
                    id: (res.data as FloorObject).id,
                    name: (res.data as FloorObject).name || "unnamed floor",
                    buildingID: (res.data as FloorObject).buildingID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, flr: FloorObject): Promise<FloorObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/floor/${id}`,
                    data: flr
                });

                if (res) return ({
                    id: (res.data as FloorObject).id,
                    name: (res.data as FloorObject).name || "unnamed floor",
                    buildingID: (res.data as FloorObject).buildingID || ""
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<FloorObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/floor/all"
                });

                if (res) return (res.data.floors as FloorObject[]);
                else return [];
            } catch {
                return [];
            }
        }
    };

    static Doorway = class {
        static async get(id: string): Promise<DoorwayObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/doorway/${id}`
                });

                if (res) return ({
                    id: (res.data as DoorwayObject).id,
                    inRoomID: (res.data as DoorwayObject).inRoomID,
                    outRoomID: (res.data as DoorwayObject).outRoomID
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, drw: DoorwayObject): Promise<DoorwayObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/doorway/${id}`,
                    data: drw
                });

                if (res) return ({
                    id: (res.data as DoorwayObject).id,
                    inRoomID: (res.data as DoorwayObject).inRoomID,
                    outRoomID: (res.data as DoorwayObject).outRoomID
                });
            } catch {
                return undefined;
            }
        }
    };

    static Camera = class {
        static async get(id: string): Promise<CameraObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: `/camera/${id}`
                });

                if (res) return ({
                    id: (res.data as CameraObject).id,
                    name: (res.data as CameraObject).name || "unnamed camera",
                    userID: (res.data as CameraObject).userID || "",
                    location: (res.data as CameraObject).location || "",
                });
            } catch {
                return undefined;
            }
        }

        static async patch(id: string, cam: CameraObject): Promise<CameraObject | undefined> {
            try {
                let res = await APIManager.request({
                    method: "patch",
                    url: `/camera/${id}`,
                    data: cam
                });

                if (res) return ({
                    id: (res.data as CameraObject).id,
                    name: (res.data as CameraObject).name || "unnamed camera",
                    userID: (res.data as CameraObject).userID || "",
                    location: (res.data as CameraObject).location || "",
                });
            } catch {
                return undefined;
            }
        }

        static async all(): Promise<CameraObject[]> {
            try {
                let res = await APIManager.request({
                    method: "get",
                    url: "/camera/all"
                });

                if (res) return (res.data.cameras as CameraObject[]);
                else return [];
            } catch {
                return [];
            }
        }
    };
}
