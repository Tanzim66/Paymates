import React, {useEffect, useState, useRef} from 'react';
import {connect} from 'react-redux';
import {useParams} from 'react-router-dom';
import {CanvasArea, Canvas, PageContainer,
  ToolSection, AddPostDialog, ErrorContainer,
  BreadcrumbSection} from './GroupCanvas.styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FabricService from '../../services/fabric.service';
import postsAPI from '../../api/posts.api';
import groupsAPI from '../../api/groups.api';

function GroupCanvas({auth}) {
  const {groupID} = useParams();

  const [group, setGroup] = useState({});
  const [canvas, setCanvas] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState({open: false, msg: ''});

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  const editRef = useRef(editMode);
  const deleteRef = useRef(deleteMode);

  useEffect(async () => {
    const newCanvas = FabricService.initCanvas();

    const res = await groupsAPI.getGroup(groupID);
    setGroup(res.data.data.getGroup);

    setCanvas(newCanvas);
    loadPosts(newCanvas);

    dropPostListener(newCanvas);
    editPostListener(newCanvas);
    deletePostListener(newCanvas);
  }, []);

  useEffect(() => {
    editRef.current = editMode;
  }, [editMode]);

  useEffect(() => {
    deleteRef.current = deleteMode;
  }, [deleteMode]);


  const loadPosts = async (canvas) => {
    const posts = await postsAPI.getPostsByGroup(groupID);
    posts.data.data.getPostsByGroup.map((post) => {
      const fabricObject = FabricService.createPost(post);
      canvas.add(fabricObject);
    });
  };

  const handleAddPost = async () => {
    if (!title || !message) {
      return setError('A title and message are required!');
    }

    const post = {
      title: title,
      message: message,
      group: groupID,
      left: 300,
      top: 300,
    };

    const res = await postsAPI.createPost(post);
    const savedPost = res.data.data.createPost;

    savedPost.author = auth.user.username;
    const fabricObject = FabricService.createPost(savedPost);

    canvas.add(fabricObject);
    setOpenAddModal(false);
  };

  const handleEditPost = async () => {
    if (!title || !message) {
      return setError('A title and message are required!');
    }

    editingPost.title = title;
    editingPost.message = message;

    const updatedPost = {
      id: editingPost.postID,
      group: editingPost.groupID,
      title: editingPost.title,
      message: editingPost.message,
      left: editingPost.left,
      top: editingPost.top,
    };
    await postsAPI.updatePost(updatedPost);
    setEditingPost(null);
    setEditMode(false);
    setOpenSnackbar({open: false});
    handleCloseDialog();

    updatedPost.author = editingPost.author;
    const fabricObject = FabricService.createPost(updatedPost);
    canvas.remove(editingPost);
    canvas.add(fabricObject);
  };

  const dropPostListener = (canvas) => {
    let isObjectMoving = false;

    canvas.on('object:moving', (_e) => {
      isObjectMoving = true;
    });

    canvas.on('mouse:up', async (e) => {
      if (isObjectMoving) {
        isObjectMoving = false;
        const obj = e.target;
        const post = {
          id: obj.postID,
          group: obj.groupID,
          title: obj.title,
          message: obj.message,
          left: parseInt(obj.left, 10),
          top: parseInt(obj.top, 10),
        };

        await postsAPI.updatePost(post);
      }
    });
  };

  const editPostListener = (canvas) => {
    canvas.on('mouse:down', async (e) => {
      const inEditMode = editRef.current;
      const obj = e.target;

      if (inEditMode && obj && obj.name == 'post') {
        setOpenAddModal(true);
        setTitle(obj.title);
        setMessage(obj.message);
        setEditingPost(obj);
      }
    });
  };

  const deletePostListener = (canvas) => {
    canvas.on('mouse:down', async (e) => {
      const inDeleteMode = deleteRef.current;
      const obj = e.target;

      if (inDeleteMode && obj && obj.name == 'post') {
        const a = await postsAPI.deletePost({id: obj.postID,
          group: obj.groupID});
        canvas.remove(obj);
      }
    });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setOpenSnackbar({
      open: !openSnackbar.open,
      msg: 'Click on a post to edit!',
    });
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setOpenSnackbar({
      open: !openSnackbar.open,
      msg: 'Click on a post to delete!',
    });
  };

  const handleCloseDialog = () => {
    setTitle('');
    setMessage('');
    setOpenAddModal(false);
  };

  return (
    <PageContainer>
      <CanvasArea>
        <Canvas id="canvas"></Canvas>
        <BreadcrumbSection>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/groups">
            Groups
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href={'/groups/' + groupID}
            >
              {group && group.name}
            </Link>
            <Typography color="text.primary">Canvas</Typography>
          </Breadcrumbs>
        </BreadcrumbSection>
        <ToolSection>
          <Fab color="primary" onClick={() => setOpenAddModal(!openAddModal)}>
            <AddIcon />
          </Fab>
          <Fab color="primary" disabled={deleteMode}
            onClick={toggleEditMode}>
            { editMode ? <CloseIcon /> : <EditIcon /> }
          </Fab>
          <Fab color="primary" disabled={editMode}
            onClick={toggleDeleteMode}>
            { deleteMode ? <CloseIcon /> : <DeleteIcon /> }
          </Fab>
        </ToolSection>
      </CanvasArea>
      <AddPostDialog
        onClose={handleCloseDialog}
        open={openAddModal}
      >
        <DialogTitle id="simple-dialog-title">
          {editMode ? 'Edit Post' : 'Create Post'}
        </DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Title" fullWidth
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}/>
          <TextField margin="dense" label="Message" fullWidth variant="standard"
            multiline
            value={message}
            rows={4}
            onChange={(e) => setMessage(e.target.value)}
          />
          <ErrorContainer>{error ?? null}</ErrorContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={editMode ? handleEditPost : handleAddPost}>
            {editMode ? 'Edit Post!' : 'Add Post!'}
          </Button>
        </DialogActions>
      </AddPostDialog>
      <Snackbar
        open={openSnackbar.open}
      >
        <Alert severity="info">
          {openSnackbar.msg}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(GroupCanvas);
