import { useEffect, useState, type ReactNode } from "react";
import { MermaidDiagram } from "@lightenna/react-mermaid-diagram";
import { APIManager, type BuildingObject, type DepartmentObject, type FloorObject, type OrganisationObject, type RoomObject } from "~/managers/APIManager";

export const StructureDiagram = (): ReactNode => {
    const [diagram, setDiagram] = useState("");
    const [organisations, setOrganisations] = useState<OrganisationObject[]>([]);
    const [departments, setDepartments] = useState<DepartmentObject[]>([]);
    const [buildings, setBuildings] = useState<BuildingObject[]>([]);
    const [floors, setFloors] = useState<FloorObject[]>([]);
    const [rooms, setRooms] = useState<RoomObject[]>([]);
    const [loaded, setLoaded] = useState(false);

    const constructDiagram = () => {
        let out = "\%\%{init: {\"flowchart\": {\"defaultRenderer\": \"elk\"}} }\%\%\nflowchart TD\n";

        organisations.forEach(x => {
            out += `\to${x.id}[["${x.name} (${x.id})"]]\n`;
        });

        departments.forEach(x => {
            out += `\td${x.id}("${x.name} (${x.id})")\n`;
            out += `\to${x.organisationID} --> d${x.id}\n`;
        });

        buildings.forEach(x => {
            out += `\tb${x.id}(["${x.name} (${x.id})"])\n`;
            out += `\td${x.departmentID} --> b${x.id}\n`;
        });

        floors.forEach(x => {
            out += `\tf${x.id}{{"${x.name} (${x.id})"}}\n`;
            out += `\tb${x.buildingID} --> f${x.id}\n`;
        });

        rooms.forEach(x => {
            out += `\tr${x.id}["${x.name} (${x.id})"]\n`;
            out += `\tf${x.floorID} --> r${x.id}\n`;
        });

        setDiagram(out);
        console.info(out);
    };

    const load = async () => {
        let thingsLoaded = [
            false,
            false,
            false,
            false,
            false
        ];
        setOrganisations(await APIManager.Organisation.all().finally(() => {
            thingsLoaded[0] = true;
        }));
        setDepartments(await APIManager.Department.all().finally(() => {
            thingsLoaded[1] = true;
        }));
        setBuildings(await APIManager.Building.all().finally(() => {
            thingsLoaded[2] = true;
        }));
        setRooms(await APIManager.Room.all().finally(() => {
            thingsLoaded[3] = true;
        }));
        setFloors(await APIManager.Floor.all().finally(() => {
            thingsLoaded[4] = true;
        }));

        while (thingsLoaded.some(x => !x)) { }
    };

    useEffect(() => {
        load().then(() => {
            setLoaded(!loaded);
        });
    }, []);

    useEffect(() => {
        constructDiagram();
    }, [loaded]);

    return (
        <MermaidDiagram>
            {diagram}
        </MermaidDiagram>
    );
};
