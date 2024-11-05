import { useNode, useEditor } from '@craftjs/core';
import { Resizer } from '../Resizer';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';

const OnOffDir = {true: 'row', false: 'column'}

const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
//  background: { r: 255, g: 255, b: 255, a: 1 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100px',
  height: '100px',
};


export function RatingBox(props) {
  props = {
    ...defaultProps,
    ...props,
  }

  const {
    stars,
    flexdir,
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    // background,
    color,
    padding,
    margin,
    shadow,
    radius,
  } = props


  const {
    connectors: { connect, drag },
    actions: {setProp},
  } = useNode()

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        // background: `rgba(${Object.values(background)})`,
        color: `rgba(${Object.values(color)})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? 'none'
            : `0px 3px 100px ${shadow}px rgba(0, 0, 0, 0.13)`,
        borderRadius: `${radius}px`,
        flex: fillSpace === 'yes' ? 1 : 'unset',
      }}
    >
        <Rating
          sx={{flexDirection: flexdir}}
          value={stars}
          onChange={(_, newValue) => {
            setProp(props => props.stars = newValue)
          }}
        />
    </Resizer>
  )
}

const RatingSettings = () => {
  const {
    actions: { setProp },
    flexdir
  } = useNode((node)=> ({
    flexdir: node.data.props.flexdir
  }))

  return (
    <FormControl size="small" component="fieldset" sx={{ml: '3px', pb: 1}} >
        <FormControlLabel control={<Switch defaultChecked onChange={(e)=> {
            setProp(props=>props.flexdir=OnOffDir[e.target.checked])
        }} />} 
          label={`${flexdir}`}
        />
    </FormControl>
  )
}

export const RatingBoxDefaultProps = {
  stars: 1,
  flexdir: "row"
}

RatingBox.craft = {
  displayName: "Rating",
  props: {...RatingBoxDefaultProps, ...defaultProps},
  related: {
    settings: RatingSettings
  }
}