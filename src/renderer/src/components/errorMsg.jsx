import { useRouteError } from "react-router-dom";
import Alert from '@mui/material/Alert';

export default function ErrorMsg() {
  const error = useRouteError()

  if (error) {
    if (Array.isArray(error)) {
      let data = error[0]
      let err = error[1]
      return  (
        <Alert severity="error">出错了: {data},  {err.status} {err.statusText} {err.message}</Alert>
      )
    }
  } else {
    <>
    </>
  }
}
