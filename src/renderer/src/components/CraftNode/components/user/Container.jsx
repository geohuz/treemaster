import { useNode, useEditor } from '@craftjs/core';
import { NodeFrame, NodeFrameSettings, NodeFrameDefaultProps } from './NodeFrame'
import { css } from '@emotion/react';
import { Slider } from '@mui/material';
import { FormControl, FormLabel } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MuiColorInput } from 'mui-color-input'

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import Chip from '@mui/material/Chip'
import InfoIcon from '@mui/icons-material/Info';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles';
import {themeColors} from '../../../../global'
import { styled } from '@mui/material/styles';

import appStore from '../../../../stores/store'
import {observer} from 'mobx-react-lite'

const dir = {'row': 'vertically', 'column': 'horizontally'}
const [colors, hexColor] = themeColors()

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} sx={{p: 0}}  square {...props} />
))(({ theme }) => (
  {
  '&:before': {
    display: 'none',
  },
}));

export const Container = observer(({background, padding, alignItems, children, ...props}) => {
  const { direction, connectors: { connect, drag }, id: containerNodeId, name} 
    = useNode(node=> ({direction: node.data.custom.direction, name: node.data.custom.displayName}))

  const { isBeingDraggedOver } = useEditor((state, query) => {
    // we have to look through all the ancestors (and the element itself) the user currently drags over
    let isBeingDraggedOver = false;

    for (const nodeId of query.getDraggedOverNodes()) {
      // we are looking for the first canvas element
      if (query.node(nodeId).isCanvas()) {
        // if the id of first canvas element is the same as this Container's id we know that the user is dragging over this Container
        if (nodeId === containerNodeId) {
          isBeingDraggedOver = true;
        }
        // Since we are only interested in the first Canvas, we break out of the loop
        break;
      }
    }

    return {
      isBeingDraggedOver,
    };
  });

  return (
    <div
      ref={dom => connect(dom)}
      className={isBeingDraggedOver ? "droparea" : ""}
      // datatooltip={name}
      css={css`
        background: ${background};
        padding: ${padding}px; 
        // detect empty TextInput
        display: ${appStore.emptyTextInput? 'block' : 'flex'};
        flex-flow: ${direction} wrap;
        align-items: ${alignItems};
        /* margin-bottom: auto; */
        /* justify-content: space-between;*/
        justify-content: center;
        outline: ${isBeingDraggedOver ? '1px dashed blue' : undefined}; 
      `}
    >
      {children}
    </div>
  );
});

export const ContainerSettings = () => {
  const {
    background,
    padding,
    alignItems,
    direction,
    actions: { setProp, setCustom },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    alignItems: node.data.props.alignItems,
    direction: node.data.custom.direction
  }));

  const theme = useTheme()

  return (
    <div>
      <Chip 
        icon={<InfoIcon />} 
        color="secondary"
        size="small"
        sx={{
        height: 'auto',
        '& .MuiChip-label': {
          display: 'block',
          whiteSpace: 'normal',
        },
        }}
        label="press backspace to delete the none-root node." 
      />
      <FormControl fullWidth margin="normal" component="fieldset">
        <FormLabel component="legend">Direction</FormLabel>
        <RadioGroup value={direction} row  
          onChange={e=>setCustom(custom => 
            (custom.direction = e.target.value), 500)}
        >
          <FormControlLabel value="row" control={<Radio size="small" />} label="row" />
          <FormControlLabel value="column" control={<Radio size="small" />} label="column" />
        </RadioGroup>
      </FormControl>
      <FormControl fullWidth={true} margin="normal" component="fieldset">
        <FormLabel component="legend">Background</FormLabel>
        <MuiColorInput
          name="background-color"
          value={background}
          onChange={(color) => {
            setProp((props) => (props.background = color), 500);
          }}
        />
      </FormControl>
      <FormControl fullWidth={true} margin="dense" component="fieldset">
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="body2">Theme Color</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {colors.map(value=> {
                return (
                  <Grid key={value} item xs={12} sm={4}>
                    <Box sx={{bgcolor: value, cursor: "pointer"}} onClick={()=> {
                      setProp(props=>(props.background = hexColor(theme, value)), 500)
                    }}>
                      &nbsp; 
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </FormControl>
      <FormControl fullWidth={true} margin="normal" component="fieldset">
        <FormLabel component="legend">Padding</FormLabel>
        <Slider
          value={padding}
          min={5}
          step={1}
          onChange={(_, value) =>
            setProp((props) => (props.padding = value), 500)
          }
        />
      </FormControl>
      <FormControl >
        <FormLabel id="group-label">{`Align item ${dir[direction]}`}</FormLabel>
        <RadioGroup value={alignItems} column 
          onChange={(e)=>setProp(props=>(props.alignItems=e.target.value), 500)} 
        >
          <FormControlLabel value="flex-start" control={<Radio size="small" />} label="Start" />
          <FormControlLabel value="center" control={<Radio size="small" />} label="Middle" />
          <FormControlLabel value="flex-end" control={<Radio size="small" />} label="End" />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export const ContainerDefaultProps = {
  background: '#eee',
  padding: 5,
  alignItems: 'center',
};

Container.craft = {
  display: "Container",
  props: ContainerDefaultProps,
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true
    // canMoveIn: (incomingNodes, self, helper) => {
    //   // incomingNodes.every(node=>{
    //   //   return (node.data.custom.direction===helper(self.id).get().data.custom.direction)
    //   // })
    // }
  },
  custom: {
    direction: 'row',
  }
}

/*
        outline: ${isBeingDraggedOver ? '2px dashed blue' : undefined}; 
*/
