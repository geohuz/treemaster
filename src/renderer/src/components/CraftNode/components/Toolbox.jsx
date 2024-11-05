import { useEditor, Element } from '@craftjs/core';
import {
  Box,
  Typography,
  Grid,
  Button as MaterialButton,
} from '@mui/material';
import React, {memo} from 'react';

import { Container } from './user/Container';
import { Text } from './user/Text';
import { ImageBox} from './user/ImageBox'
import { RatingBox } from './user/RatingBox'
import {genSlateContent} from '../utils'

import Tooltip from '@mui/material/Tooltip'
import PhotoIcon from '@mui/icons-material/Photo';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import IconButton from '@mui/material/IconButton';
import StarOutlineIcon from '@mui/icons-material/StarOutline';


export const Toolbox = memo(() => {
  const { connectors } = useEditor();

  return (
    <Box sx={{pt: 2}}>
      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        spacing={1}
      >
        {/* <Box pb={2}> */}
        {/*   <Typography>Drag to add</Typography> */}
        {/* </Box> */}
        <Grid container direction="column" item>
          <Tooltip title="drag text into node" placement="right">
          <IconButton
            ref={(ref) => connectors.create(ref, <Text text={genSlateContent("Text")} />)}
            variant="contained"
            data-cy="toolbox-text"
          >
            <TextFieldsIcon />
          </IconButton>
          </Tooltip>
        </Grid>
        <Grid container direction="column" item>
          <Tooltip title="drag image container into node" placement="right">
          <IconButton
            ref={(ref) => connectors.create(ref, <ImageBox displayName="image"/>)}
            variant="contained"
            data-cy="toolbox-image"
          >
            <PhotoIcon />
          </IconButton>
          </Tooltip>
        </Grid>
        <Grid container direction="column" item>
          <Tooltip title="drag container into node" placement="right">
            <IconButton
              ref={(ref) =>
                connectors.create(
                  ref,
                  <Element id="Container" canvas is={Container}>
                    {/* must have a text component, otherwise can't drag in */}
                    <Text text={genSlateContent("container")} />
                  </Element>
                )
              }
              variant="contained"
              data-cy="toolbox-container"
            >
              <DeveloperBoardOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        {/* <Grid container direction="column" item>
          <Tooltip title="drag column container into node" placement="right">
            <IconButton
              ref={(ref) =>
                connectors.create(
                  ref,
                  <Element id="Container" canvas is={Container} custom={{direction: "column", displayName: "column container"}}>
                    <Text text={genSlateContent("column container")} />
                  </Element>
                )
              }
              variant="contained"
              data-cy="toolbox-container"
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
        </Grid> */}
        <Grid container direction="column" item>
          <Tooltip title="drag rating into node" placement="right">
            <IconButton
              ref={ref=> connectors.create(ref, <RatingBox 
                displayName="rating" />)}
              variant="contained"
            >
              <StarOutlineIcon />
            </IconButton>  
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
});
