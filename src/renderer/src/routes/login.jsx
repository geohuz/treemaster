import { 
  Form, 
  useLocation,
  Navigate,
  useNavigation,
  useActionData,
} from "react-router-dom"
import {api} from '../stores/api'
import {observer} from 'mobx-react-lite'
import {TextField, Button, Container, Box, Grid} from "@mui/material"
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
// import LoadingButton from '@mui/lab/LoadingButton';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'版权 © '}
      <Link color="inherit" href="">
        Master Company
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export const action = async ({params, request}) => {
  const formData = await request.formData()
  const loginData = Object.fromEntries(formData)

  await api.login(loginData)

  return null 
}

const Login = observer((props) => {
  const navigation = useNavigation()
  const busy = navigation.state === "submitting"

  const error = useActionData()
  const location = useLocation()

  return (
  <Container maxWidth="xs">
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
    <Avatar sx={{m:1, bgcolor: 'secondary.main' }}>
      <LockOutlinedIcon />
    </Avatar>
    <Typography component="h1" variant="h5">
      登 录
    </Typography>
    <Box sx={{mt: 1}}>
      <Form method="post" disabled={busy}>
        <TextField 
          required
          fullWidth
          margin="normal"
          label="邮件地址" 
          variant="outlined" 
          name="email"
          error={error!==undefined}
          helperText={error?.email}
          autoFocus
        />
        <TextField 
          required
          fullWidth
          margin="normal"
          label="密码" 
          variant="outlined" 
          name="pass"
          error={error!==undefined}
          helperText={error?.pass}
        />
        <Button
          variant="contained" 
          loading={busy}
          type="submit" 
          fullWidth
          sx={{mt:3, mb: 2}}
        >
          登录
        </Button>
        {props.outlet && props.outlet}
      </Form>
    </Box>
    </Box>
    {/* 
      如果之前没有要去的路由则去contacts
      否则去之前的路由
    */}
    {api.getToken() && 
      <Navigate to={location.state? location.state.from.path : "/app"}  replace />
    }
    <Copyright sx={{ mt: 8, mb: 4 }} />
  </Container>
  )
})

export default Login

/*
mt: marginTop
mb: marginBottom
breakpoints
xs, extra-small: 0px
sm, small: 600px
md, medium: 900px
lg, large: 1200px
xl, extra-large: 1536px
*/
