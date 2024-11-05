/* filename has to be .jsx otherwise icons can't be put into data structure */
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';

const navStructure = 
[
  // {
  //   key: 'settings', 
  //   title: "Settings",
  //   icon: <DraftsIcon />,
  //   link: 'settings' // path 
  //   // children: [
  //   //   {
  //   //     key: "innbox",
  //   //     title: "Innbox",
  //   //     link: 'innnnnnbox',
  //   //     icon: <InboxIcon />,
  //   //   }
  //   // ],
  // },
]


export function getPath(xs, keyName) {
  return getNav(xs, keyName).link
}

export function getNav(xs, keyName) {
  let flattenXS = flat(xs)
  return flattenXS.filter(item=>item.key === keyName)[0]
}

export function flat(array) {
    var result = [];
    array.forEach(item => {
        result.push(item);
        if (Array.isArray(item.children)) {
            // 注意用concat合并数组
            result = result.concat(flat(item.children));
        }
    });
    return result;
}

export default navStructure
