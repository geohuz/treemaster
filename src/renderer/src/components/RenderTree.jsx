import { useState, useEffect } from 'react'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom'


const RenderTree = ({data}) => {
  // cheveat: 递归渲染组件的useState有多个副本, 各自不影响
  // 但要注意不要使用unmountOnExit否则
  // 组件其实关闭后就被卸载所以状态总是被初始化
  // 去掉这个属性就能记住折叠状态
  const [fold, setFold] = useState(true)

  function switchFold() {
    setFold(!fold)
  }

  return (
    <List disablePadding>
      {data.map(node => {
        const hasChildren = node?.children?.length > 0
        return (
          <div key={node.key}>
            {/* 首先渲染item */}
            {/* 如果有分支则渲染带折叠的, click switch open/close的item */}
            {/* 否则渲染不带折叠, 并且有路由的item */}
            {hasChildren ?
              <ListItemButton onClick={switchFold}>
                <ListItemIcon>
                  {node.icon}
                </ListItemIcon>
                <ListItemText primary={node.title} />
                {fold ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              :
              <ListItemButton component={Link} to={node.link}>
                <ListItemIcon>
                  {node.icon}
                </ListItemIcon>
                <ListItemText primary={node.title} />
              </ListItemButton>
            }
            {/* 如果item有分支则递归渲染 */}
            { hasChildren && 
            <Collapse in={fold}>
              <List disablePadding sx={{pl: 2}}>
                <RenderTree data={node.children} />
              </List>
            </Collapse>
            }
          </div>
        )
      })}
    </List>
  )
}

export default RenderTree
