import React, { memo, useState, useCallback } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import appStore from '../../stores/store'
import ShareIcon from '@mui/icons-material/Share';


const options = [
  {
    value: 'smoothstep',
    label: 'Smoothstep',
  },
  {
    value: 'step',
    label: 'Step',
  },
  {
    value: 'default',
    label: 'Bezier (default)',
  },
  {
    value: 'straight',
    label: 'Straight',
  },
];

export default function SelectEdge({edgeRefresh}) {
  const [edgeType, setEdgePathType] = useState('default')
  const handleChange = useCallback((evt) => {
    setEdgePathType(evt.target.value)
    appStore.setEdgePath(evt.target.value)
    edgeRefresh()
  }, []);

  return (
    <FormControl sx={{ m: 1, minWidth: 160}} size="small">
      <InputLabel sx={{color: "inherit"}}>Edge Type</InputLabel>
      <Select
        sx={{color: "inherit"}}
        id="select-small"
        label="Edge Type"
        value={edgeType}
        onChange={handleChange}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
