import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { APIManager, type FloorObject, type BuildingObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    buildingID: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllFloorsPage = ({ floors }: { floors: FloorObject[]; }): ReactNode => {
    const [buildingNames, setBuildingNames] = useState(new Map());
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorName, setEditorName] = useState("");
    const [editorBuilding, setEditorBuilding] = useState("");
    const [editorID, setEditorID] = useState("");
    const [editorAllBuildings, setEditorAllBuildings] = useState<BuildingObject[]>([]);

    const loadBuildingName = async (id: string) => {
        let building = await APIManager.Building.get(id);
        if (building) {
            const dupeOrgNames = new Map(buildingNames);
            dupeOrgNames.set(id, building.name);
            setBuildingNames(dupeOrgNames);
        }
    };

    const getBuildingName = (id: string) => {
        if (buildingNames.has(id)) return buildingNames.get(id);
        else loadBuildingName(id);
        return id;
    };

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let floor = floors.find(x => x.id == id)!;
        setEditorName(floor.name);
        setEditorBuilding(floor.buildingID);

        if (!editorAllBuildings.length) {
            let floors = await APIManager.Building.all();
            setEditorAllBuildings(floors);
        }

        setEditorOpen(true);
    };

    return (
        <Box
            sx={{
                px: {
                    xs: 2,
                    md: 6
                }
            }}
        >
            <TableContainer
                component={Paper}
            >
                <Dialog
                    open={editorOpen}
                    onClose={closeEditor}
                >
                    <DialogTitle>
                        edit floor
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            use the fields below to change the floor's properties!
                        </DialogContentText>
                        <Divider
                            sx={{
                                my: 2,
                                mx: -3
                            }}
                        />
                        <form
                            id="floor-editor"
                            onSubmit={async (e: React.SubmitEvent<RoomEditorFormElement>) => {
                                e.preventDefault();

                                let floor: FloorObject = {
                                    id: editorID,
                                    name: editorName,
                                    buildingID: editorBuilding,
                                };

                                await APIManager.Floor.patch(editorID, floor);

                                // refresh
                                navigate(0);
                            }}
                        >
                            <Stack
                                gap={1}
                            >
                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>name</FormLabel>
                                    <OutlinedInput
                                        type="text"
                                        name="name"
                                        value={editorName}
                                        onChange={e => setEditorName(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl
                                    required
                                    sx={{
                                        width: "100%"
                                    }}
                                >
                                    <FormLabel>building</FormLabel>
                                    <Select
                                        value={editorBuilding}
                                        onChange={e => setEditorBuilding(e.target.value)}
                                    >
                                        {editorAllBuildings.map(x => (
                                            <MenuItem
                                                key={x.id}
                                                value={x.id}
                                            >
                                                {x.name} ({x.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={closeEditor}
                        >
                            cancel
                        </Button>
                        <Button
                            type="submit"
                            form="floor-editor"
                            variant="contained"
                            color="primary"
                        >
                            submit
                        </Button>
                    </DialogActions>
                </Dialog>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>name</TableCell>
                            <TableCell align="right">id</TableCell>
                            <TableCell align="right">building</TableCell>
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            floors.map(x => (
                                <TableRow
                                    key={x.id}
                                >
                                    <TableCell>
                                        <Link
                                            to={`/floor/${x.id}`}
                                        >
                                            {x.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">{x.id}</TableCell>
                                    <TableCell align="right">{getBuildingName(x.buildingID)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => {
                                                openEditorFor(x.id);
                                            }}
                                        >
                                            <EditRounded />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
