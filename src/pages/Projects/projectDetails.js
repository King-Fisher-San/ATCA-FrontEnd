import {
  Button,
  Card,
  Container,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { filter } from "lodash";

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Page from "src/components/Page";
import Scrollbar from "src/components/Scrollbar";
import SearchNotFound from "src/components/SearchNotFound";
import {
  UserListHead,
  UserListToolbar,
  UserMoreMenu,
} from "src/components/_dashboard/user";
import { AuthContext } from "src/Contexts/AuthContext";
import { ProjectsContext } from "src/Contexts/ProjectsContext";
import ConfirmDelete from "src/dialogs/ConfirmDialogBox";
import { useToggleInput } from "src/hooks";
import { handleCatch, makeReq } from "src/utils/makeReq";
import v4 from "uuid/dist/v4";
import AddTestCase from "./AddTestCase";

const TABLE_HEAD = [
  { _id: "name", label: "Name", alignRight: false },
  { _id: "language", label: "Language", alignRight: false },
  { _id: "preRequiste", label: "PreRequiste", alignRight: false },
  { _id: "priority", label: "Priority", alignRight: false },
  {
    _id: "difficultyLevel",
    label: "Difficulty Level",
    alignRight: false,
  },
  { _id: "BoxType", label: "Testing Type", alignRight: false },
  { _id: "assign", label: "Assigned To", alignRight: false },
  { _id: "Current Status", label: "Status", alignRight: false },
  { _id: "Report", label: "Report", alignRight: false },
  { _id: "scenarios", label: "Scanerios", alignRight: false },
  { _id: "" },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

const ProjectDetails = () => {
  const { getProjectById, projects, loading } = useContext(ProjectsContext);
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState();

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDeleteOpen, toggleDelOpen] = useToggleInput(false);
  // eslint-disable-next-line
  const [isEditOpen, toggleEditOpen] = useToggleInput(false);

  const [isAddTestOpen, toggleAddTestOpen] = useToggleInput(false);
  // eslint-disable-next-line
  const [projectState, setProjectState] = useState({
    name: "",
    language: "",
    preRequiste: "",
    priority: "",
    difficultyLevel: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const data = getProjectById(id);
    if (!data) return navigate("/dashboard/projects");
    setProject(data);
    setProjectState(data);
    // eslint-disable-next-line
  }, [id, loading, projects]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteTest = async (newState) => {
    try {
      toggleDelOpen();
      // eslint-disable-next-line
      const resData = await makeReq(`/projects/test/${selected}`, {}, "DELETE");
      toast.success("Test Deleted Successfully!");

      setProject((st) => ({
        ...st,
        tests: st.tests.filter((el) => el._id !== selected),
      }));
      setSelected(null);
    } catch (err) {
      handleCatch(err);
    } finally {
    }
    console.log("newState", newState);
  };

  const createtestCase = async (newState) => {
    try {
      toggleAddTestOpen();
      const resData = await makeReq(
        `/projects/${id}/tests`,
        { body: newState },
        "POST"
      );
      toast.success("Test Created Successfully!");

      setProject((st) => ({
        ...st,
        tests: [resData.test, ...st.tests],
      }));
    } catch (err) {
      handleCatch(err);
    } finally {
    }
    console.log("newState", newState);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = project?.tests?.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (project?.tests?.length || 0))
      : 0;

  const filteredData = applySortFilter(
    project?.tests || [],
    getComparator(order, orderBy),
    filterName
  );

  const isUserNotFound = filteredData.length === 0;

  const downloadReport = (id) => {
    window.open(`http://localhost:7000/api/download/${id}`);
  };

  if (!project) return <></>;
  console.table(project.tests);
  return (
    <Page title={`Project | ${project.name}`}>
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Project {project.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            style={{ float: "right" }}
            onClick={toggleAddTestOpen}
          >
            New Test Case
          </Button>
        </Stack>

        <Typography variant="h5">Test Cases</Typography>
        <Card>
          <UserListToolbar
            numSelected={selected?.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            slug="Users"
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={project?.tests?.length || 0}
                  numSelected={selected?.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                  noCheckBox
                />
                <TableBody>
                  {loading
                    ? Array(5)
                        .fill()
                        .map(() => {
                          return (
                            <TableRow
                              hover
                              key={v4()}
                              tabIndex={-1}
                              role="checkbox"
                              sx={{
                                cursor: "pointer",
                                textDecoration: "none",
                              }}
                            >
                              {Array(6)
                                .fill()
                                .map(() => (
                                  <TableCell key={v4()} align="right">
                                    <Skeleton />
                                  </TableCell>
                                ))}
                            </TableRow>
                          );
                        })
                    : project.tests
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => {
                          const {
                            _id,
                            name,
                            language,
                            preRequiste,
                            priority,
                            difficultyLevel,
                            scenarios,
                            BoxType,
                            assigned,
                            status,
                          } = row;
                          const isItemSelected = selected?.indexOf(name) !== -1;

                          return (
                            <TableRow
                              hover
                              key={_id}
                              tabIndex={-1}
                              role="checkbox"
                              selected={isItemSelected}
                              aria-checked={isItemSelected}
                            >
                              <TableCell padding="checkbox"></TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                padding="none"
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={2}
                                >
                                  <Typography variant="subtitle2" noWrap>
                                    {name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="left">{language}</TableCell>
                              <TableCell align="left">{preRequiste}</TableCell>
                              <TableCell align="left">{priority}</TableCell>
                              <TableCell align="left">
                                {difficultyLevel}
                              </TableCell>
                              <TableCell align="left">{BoxType}</TableCell>
                              <TableCell align="left">
                                {assigned
                                  ? assigned.name
                                    ? assigned.name
                                    : "-"
                                  : "No"}
                              </TableCell>
                              <TableCell align="left">
                                {status ? status : "No Status"}
                              </TableCell>
                              <TableCell align="left">
                                {status === "pending" ? (
                                  "Not available"
                                ) : (
                                  <Button
                                    onClick={() => {
                                      downloadReport(_id);
                                    }}
                                  >
                                    Download
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell align="left">
                                {scenarios?.length || 0}
                              </TableCell>
                              {user && (
                                <TableCell align="right">
                                  <UserMoreMenu
                                    currentProject={row}
                                    viewTask
                                    viewLink={`/dashboard/projects/${id}/tests/${_id}`}
                                    toggleDelOpen={toggleDelOpen}
                                    toggleEditOpen={toggleEditOpen}
                                    setSelected={setSelected}
                                    user={user}
                                    isProject
                                  />
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <ConfirmDelete
            open={isDeleteOpen}
            toggleDialog={toggleDelOpen}
            dialogTitle="Delete Test Scanerio ? "
            success={handleDeleteTest}
          />

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={project?.tests?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          <AddTestCase
            open={isAddTestOpen}
            toggleDialog={toggleAddTestOpen}
            onSuccess={createtestCase}
          />
        </Card>
      </Container>{" "}
    </Page>
  );
};

export default ProjectDetails;
