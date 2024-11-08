import { useEditor, NodeHelpers } from '@craftjs/core';

import {
  Box,
  Chip,
  Grid,
  Typography,
  Button as MaterialButton,
} from '@mui/material';
import React from 'react';

export const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
     selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        content: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
     };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });
  //bgcolor="rgba(0, 0, 0, 0.06)" 
  return isEnabled && selected ? (
    <Box mt={0} px={2} py={2}>
      <Grid container direction="column" spacing={0}>
        <Grid item>
          <Box pb={2}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Typography variant="subtitle1">Selected</Typography>
              </Grid>
              <Grid item>
                <Chip
                  size="small"
                  color="primary"
                  label={selected.name}
                  data-cy="chip-selected"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <div data-cy="settings-panel">
          {selected.settings && React.createElement(selected.settings)}
        </div>
        {selected.isDeletable ? (
          <Box sx={{mt: 2}}>
            <MaterialButton
              fullWidth
              variant="contained"
              color="inherit"
              onClick={() => {
                actions.delete(selected.id);
              }}
            >
              Delete
            </MaterialButton>
          </Box>
        ) : null}
      </Grid>
    </Box>
  ) : null;
};
