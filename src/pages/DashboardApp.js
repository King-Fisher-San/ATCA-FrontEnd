// material
import {
  Box,
  Grid,
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Divider,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
// components
import { LOCALSTORAGE_TOKEN_KEY } from "src/Contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import Img from '../assets/img.jpeg'
import Page from "../components/Page";
import {
  ProjectStats,
  CurrentProjects,
  AppCard,
} from "../components/_dashboard/app";

import PersonIcon from "@mui/icons-material/Person";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FilePresentIcon from "@mui/icons-material/FilePresent";

// ----------------------------------------------------------------------
import { UsersContext } from "src/Contexts/UsersContext";
import { ProjectsContext } from "src/Contexts/ProjectsContext";
import { AuthContext } from "../Contexts/AuthContext";

import CheckIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import axios from "axios";

import { makeReq } from "../utils/makeReq";
import { toast } from "react-toastify";

export default function DashboardApp() {
  // User data inside user variable
  const { users } = useContext(UsersContext);
  const { user } = useContext(AuthContext);
  const form = new FormData();

  console.table(user);
  // Projects details
  const { projects } = useContext(ProjectsContext);
  console.log(projects);

  const [testers, setTesters] = useState([]);
  const [qaManagers, setQaManagers] = useState([]);

  useEffect(() => {
    if (!users) return;
    setTesters(users.filter((user) => user.role === "tester"));
  }, [users]);

  useEffect(() => {
    if (!users) return;
    setQaManagers(users.filter((user) => user.role === "qaManager"));
  }, [users]);

  let count = 0;

  for (let i = 0; i < projects.length; i++) {
    let c = 0;
    c += projects[i].tests.length;
    count += c;
  }

  const [JMD, setJMD] = useState({
    id: "",
    status: "",
    file: "",
  });
  const [open, setOpen] = useState(false);

  const onTestComplete = (val, id) => {
    console.log(val, id);
    setJMD({
      id: id,
      status: val,
      file: "",
    });
  };

  const fileUpload = async (e) => {
    console.log(e.target.files[0]);
    let selectedFile = e.target.files[0];
    let file = null;
    let fileName = "";
    let url = URL.createObjectURL(selectedFile);
    console.log(url);
    let blob = await fetch(url).then((r) => r.blob());
    form.append("uploaded_file", blob, JMD.id);

    const token = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);
    
    axios({
      method: "post",
      url: `http://localhost:7000/api/projects/test/update/${JMD.id}`,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      data: form,
    })

    console.log("File uploaded");
    setJMD({
      ...JMD,
      file: {
        name: fileName,
        content: file,
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    console.log("close");
    setJMD({
      id: "",
      status: "",
      file: "",
    });
    setOpen(false);

    window.location.reload();
  };

  const handleConfirm = async () => {
    console.log("confirm");
    setOpen(false);
    // axios.post("http://localhost:5000/api/test/complete", {)
    makeReq(`/projects/test/update/${JMD.id}`, { body: JMD }, "PATCH").then(
      (res) => {
        toast.success("Test Completed");
        window.location.reload();
      }
    );
  };

  return (
    <Page title=" Admin Dashboard">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Test Complete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to complete this test?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleClose}>
            <CancelIcon />
          </Button>
          <Button autoFocus onClick={handleConfirm}>
            <CheckIcon />
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Hi, Welcome back</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            {/* <AppWeeklySales /> */}
            <AppCard
              title="QaManagers"
              color="primary"
              TOTAL={qaManagers.length}
              Icon={PersonIcon}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppCard
              title="Testers"
              color="info"
              TOTAL={testers.length}
              Icon={PersonIcon}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AppCard
              title="Projects"
              color="warning"
              TOTAL={projects.length}
              Icon={FilePresentIcon}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppCard
              title="Test Cases"
              TOTAL={count}
              Icon={FactCheckIcon}
              color="error"
            />
          </Grid>
          {user.role === "tester" ? (
            <Grid item xs={12} sm={12} md={12}>
              <Card>
                <CardHeader title="Tests Assigned" />
                <CardContent>
                  <Container maxWidth="xl">
                    {user.tests.map((test) => {
                      if(test.status !== "pending"){
                        return <></>
                      }
                      return (
                        <>
                          <Grid container alignItems={"center"}>
                            <Grid item md={5}>
                              {test.testName}
                            </Grid>
                            <Grid item md={5}>
                              {test.projectName}
                            </Grid>
                            {JMD.id !== test.id ? (
                              <>
                                <Grid item md={1}>
                                  <Button
                                    onClick={() =>
                                      onTestComplete("Pass", test.id)
                                    }
                                  >
                                    Pass
                                  </Button>
                                </Grid>
                                <Grid item md={1}>
                                  <Button
                                    color="error"
                                    onClick={() =>
                                      onTestComplete("Fail", test.id)
                                    }
                                  >
                                    Fail
                                  </Button>
                                </Grid>
                              </>
                            ) : (
                              <Grid item md={2}>
                                <Input
                                  type="file"
                                  name="uploaded_file"
                                  onChange={fileUpload}
                                  accept="application/pdf,application/vnd.ms-excel"
                                  hidden
                                ></Input>
                              </Grid>
                            )}
                          </Grid>
                          <Divider light={false} />
                        </>
                      );
                    })}
                  </Container>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <></>
          )}
          <Grid item xs={12}>
            <img src={Img} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
