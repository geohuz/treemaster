import { useNode, useEditor } from '@craftjs/core';
import { Resizer } from '../Resizer' 

import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import CropOriginalOutlinedIcon from '@mui/icons-material/CropOriginalOutlined';
import { FormControl, FormLabel } from '@mui/material';
import Button from '@mui/material/Button'

import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

const defaultProps = {
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: ['0', '0', '0', '0'],
  margin: ['0', '0', '0', '0'],
  // background: { r: 255, g: 255, b: 255, a: 1 },
  // background: 'ef5350',
  color: { r: 0, g: 0, b: 0, a: 1 },
  shadow: 0,
  radius: 0,
  width: '100px',
  height: '100px',
};


export function ImageBox(props) {
  props = {
    ...defaultProps,
    ...props,
  };

  const {
    cropShape,
    imgData,
    crop, 
    zoom,
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    padding,
    margin,
    shadow,
    radius,
  } = props

  const {
    nodeParent,
    actions: {setProp},
  } = useNode(node=>({
    nodeParent: node.data.parent
  }))
  

  const {enabled, containerBkgColor } = useEditor((state, query) => ({
      enabled: state.options.enabled,
      // access parent props
      containerBkgColor: query.node(nodeParent).get().data.props.background
  }))



  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      style={{
        justifyContent,
        flexDirection,
        alignItems,
        // background: `rgba(${Object.values(background)})`,
        // color: `rgba(${Object.values(color)})`,
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
        <>
          { imgData &&
            <Cropper
                disableAutomaticStylesInjection
                style={
                  { 
                    cropAreaStyle: {
                      border: 0,
                      color: containerBkgColor
                    },
                  }
                }
                zoomWithScroll={true}
                crop={crop}
                zoom={zoom}
                onCropChange={crop=>
                  enabled && setProp(props=>props.crop = crop)}
                onZoomChange={zoom=>
                  enabled && setProp(props=>props.zoom = zoom)}
                objectFit="contain"
                cropShape={cropShape? "square" : "round"} 
                showGrid={false}
                image={imgData}
            >
            </Cropper>
          }
        </>
    </Resizer>
  )
}

export const ImageBoxSettings = () => {
  const {
    cropShape,
    actions: { setProp },
  } = useNode(node => ({
    cropShape: node.data.props.cropShape
  }))

  return (
    <div>
      <FormControl fullWidth={true} margin="normal" component="fieldset">
        <FormLabel component="legend">Image crop shape</FormLabel>
        {cropShape?
          <Button variant="outlined" size="large" 
            onClick={()=>setProp(prop=>prop.cropShape=false)}
            startIcon={<SupervisedUserCircleOutlinedIcon />} 
          >
            Round
          </Button>
          :
          <Button variant="outlined" size="large"
            onClick={()=>setProp(prop=>prop.cropShape=true)}
            startIcon={<CropOriginalOutlinedIcon />}
          >
            Square
          </Button>
        }
      </FormControl>
    </div>
  )
}

export const ImageBoxDefaultProps = {
  imgData: null,
  crop: {x: 0, y: 0},
  zoom: 1,
  cropShape: true,
}

ImageBox.craft = {
  displayName: 'Image',
  props: {...ImageBoxDefaultProps, ...defaultProps},
  related: {
    settings: ImageBoxSettings
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
};

