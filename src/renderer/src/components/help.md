# Tree Org User Guide


## Tree Operations

### Switching edit on/off

When you start Tree Org , the default mode is edit enabled, so you can start editing quickly. <img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%202023-07-22%20at%2010.39.53.jpg" alt="Screenshot 2023-07-22 at 10.39.53" style="zoom:50%;" />

Click on the pencil icon switching edit mode on/off, when edit is off the program is in the presentation mode, there are several UI interaction changes in this mode:

* Node content editing is disabled

* Mouse-click on the node will play expand/collapse animation
* Large text blocks will be changed to a clickable text button if they are resized to a smaller area, much like the ``more...`` button in popular article reading sites, and the full text will be presented in a popup dialog in response to the mouse-clicking.

### Add/delete node 

When you click on a node, you can see plus icons that indicate the direction of the node you can add to.

<img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%202023-07-22%20at%2010.56.42.png" alt="Screenshot 2023-07-22 at 10.56.42" style="zoom:33%;" />

click on the icon to add a node in the direction you desire. Press the ``Backspace`` on the keyboard to delete the node. 

### Edge (link line) operation

You can also select the edges (the link lines between nodes) with mouse-clicking,   ``Backspace`` to delete them. You can also link nodes manually with mouse drag&drop.

#### Manually nodes linking

You can draw edges between two nodes by clicking on one of the square ports on the node, then start dragging a line and drop to the target node port.

### Node clone

Sometimes you want to reuse the layout/content of a node and create new nodes based on it to avoid doing the same work repeatedly, click on the clone icon to do so:

<img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%20clone.jpg" alt="Screenshot clone" style="zoom:50%;" />

The clone mode is off by default, when turned on, you click on a node and then click one of the plus icons, all the child nodes will get the content from the parent node.

<img src="lifeorg/Screenshot%202023-07-24%20at%2011.26.42.png" alt="Screenshot 2023-07-24 at 11.26.42" style="zoom:33%;" />

### Tree layer distance

<img src="/Users/geohuz/MDDocs/lifeorg/layerdistance.jpg" alt="layerdistance" style="zoom: 50%;" />

The ``tree layer distance`` controls how far away the layers are apart from each other, as shown in the graph below:

<img src="/Users/geohuz/MDDocs/lifeorg/distance.png" alt="distance" style="zoom:33%;" />

the tree on the left has a shorter layer distance than the right, you can adjust the distance then use ``auto tree layout`` to see the result.

### Auto tree layout

<img src="/Users/geohuz/MDDocs/lifeorg/layout.jpg" alt="layout" style="zoom: 50%;" />

Tree Org supports two layout algorithms that automatically lay out the tree. You can incorporate the auto layout with manual adjustment to make a flexible tree layout. Be aware ``auto layout`` recalculates and overwrites any manual adjustment, so make sure to apply auto layout first then add adjustment afterward. 

``layout vertically``: 

<img src="/Users/geohuz/MDDocs/lifeorg/hlayout.png" alt="hlayout" style="zoom:33%;" />

``layout horizontally``:

<img src="/Users/geohuz/MDDocs/lifeorg/vlayout.png" alt="vlayout" style="zoom:33%;" />

## Node Operations

### container

Tree Org has a concept of ``container`` to utilize internal node layout. There are two kinds of containers which are ``row`` and ``column`` containers. Other objects (Text, Image, Rating) must be wrapped inside a container to get the corresponding layout effect. Containers can include multiple objects and can be nested. The following graph illustrates nested containers put together to make a mixed layout:

 

<img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%202023-07-22%20at%2012.10.19.png" alt="Screenshot 2023-07-22 at 12.10.19" style="zoom:33%;" />

In the above graph, we have an outmost row container, which lays out two blocks of text and one block of the image, inside the row container, the leftmost column container lays out two blocks of column text vertically, then we have another text block in the middle and an image block on the right, as these two blocks are inside the row container, so they are laid out horizontally. 

You can use a container to layout the objects inside the node effectively without specifying margin and padding numbers, they always align automatically.

An object inside a node can be moved around by dragging the move handler on the node floating menu:

<img src="lifeorg/Screenshot%202023-07-22%20at%2014.41.55.jpg" alt="Screenshot 2023-07-22 at 14.41.55" style="zoom:33%;" />

### objects toolbar

Click on a node invokes sidebars, the left sidebar has all the objects which can be dragged into the node. Be aware that Text, Image, and Rating can only be dragged into a container, so make sure there is a (row/column) container inside the node then you can drag&drop them subsequently.  During the dragging operation, you will see the drop indicator with green/red color, you can only drop into a position when the indicator turns green. 

the objects toolbar contains all the draggable objects which you can drop into a node:

<img src="lifeorg/Screenshot%202023-07-22%20at%2013.02.33.png" alt="Screenshot 2023-07-22 at 13.02.33" style="zoom:33%;" />

### settings bar

The right sidebar contains all the setting options for an object, change them to meet your needs. Be aware you need to first select the object as the name of the node floating menu indicates, then left clicking the mouse button then the right sidebar will show the corresponding options.

container settings on the right sidebar:

<img src="lifeorg/Screenshot%202023-07-22%20at%2013.06.57.png" alt="Screenshot 2023-07-22 at 13.06.57" style="zoom:33%;" />



### text editing

You can double-click the text inside a node to start editing quickly, the resize indicator will change the size to accommodate content automatically. But you can always adjust the size of the content at any time, Tree Org will detect if the content has more text as it appears, and it will change the text area to a clickable button in the presentation mode to let you click the text then popup a dialog to display the full content. So you can always have the option to balance the node size and node content.

You will notice a pencil icon on the node floating menu, click the icon to get a full-functioned rich text editor, and use it to do your editing work comfortably:

 <img src="lifeorg/Screenshot%202023-07-22%20at%2014.47.17.png" alt="Screenshot 2023-07-22 at 14.47.17" style="zoom:33%;" />

Here are two graphs showing how Tree Org makes large text editing easily and display them in presentation mode (edit off).

<img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%202023-07-22%20at%2012.44.53.png" alt="Screenshot 2023-07-22 at 12.44.53" style="zoom:33%;" />

The text block, which has been resized to an area that only shows the text "What is Lorem", is displayed in the popup dialog when the user clicks on the text button.

<img src="/Users/geohuz/MDDocs/lifeorg/Screenshot%202023-07-22%20at%2012.46.51.png" alt="Screenshot 2023-07-22 at 12.46.51" style="zoom:33%;" />