import { EditRounded } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormLabel, IconButton, MenuItem, OutlinedInput, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { APIManager, type BuildingObject, type DepartmentObject } from "~/managers/APIManager";

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    departmentID: HTMLInputElement;
}

interface RoomEditorFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}


export const AllBuildingsPage = ({ buildings }: { buildings: BuildingObject[]; }): ReactNode => {
    const [departmentNames, setDepartmentNames] = useState(new Map());
    const [editorOpen, setEditorOpen] = useState(false);
    const navigate = useNavigate();

    const [editorName, setEditorName] = useState("");
    const [editorDepartment, setEditorDepartment] = useState("");
    const [editorID, setEditorID] = useState("");
    const [editorAllDepartments, setEditorAllDepartments] = useState<DepartmentObject[]>([]);

    const loadDepartmentName = async (id: string) => {
        let department = await APIManager.Department.get(id);
        if (department) {
            const dupeOrgNames = new Map(departmentNames);
            dupeOrgNames.set(id, department.name);
            setDepartmentNames(dupeOrgNames);
        }
    };

    const getDepartmentName = (id: string) => {
        if (departmentNames.has(id)) return departmentNames.get(id);
        else loadDepartmentName(id);
        return id;
    };

    const closeEditor = () => {
        setEditorOpen(false);
    };

    const openEditorFor = async (id: string) => {
        setEditorID(id);
        let building = buildings.find(x => x.id == id)!;
        setEditorName(building.name);
        setEditorDepartment(building.departmentID);

        if (!editorAllDepartments.length) {
            let floors = await APIManager.Department.all();
            setEditorAllDepartments(floors);
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
                        edit building
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            use the fields below to change the building's properties!
                        </DialogContentText>
                        <Divider
                            sx={{
                                my: 2,
                                mx: -3
                            }}
                        />
                        <form
                            id="building-editor"
                            onSubmit={async (e: React.SubmitEvent<RoomEditorFormElement>) => {
                                e.preventDefault();

                                let building: BuildingObject = {
                                    id: editorID,
                                    name: editorName,
                                    departmentID: editorDepartment,
                                };

                                await APIManager.Building.patch(editorID, building);

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
                                    <FormLabel>department</FormLabel>
                                    <Select
                                        value={editorDepartment}
                                        onChange={e => setEditorDepartment(e.target.value)}
                                    >
                                        {editorAllDepartments.map(x => (
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
                            form="building-editor"
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
                            <TableCell align="right">department</TableCell>
                            <TableCell align="right">edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            buildings.map(x => (
                                <TableRow
                                    key={x.id}
                                >
                                    <TableCell>
                                        <Link
                                            to={`/building/${x.id}`}
                                        >
                                            {x.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">{x.id}</TableCell>
                                    <TableCell align="right">{getDepartmentName(x.departmentID)}</TableCell>
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
