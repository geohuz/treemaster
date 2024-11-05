export function PopupEditor({open, content, onChange, applyChange}) {
  const handleApply = () => {
    appStore.setRichTextMode(false)
    applyChange()
  };

  const editorStyle = css`
            overflow-y: auto; 
            overflow-x: hidden; 
            padding: 20px; 
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
            `
  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={open}
        onClose={()=>appStore.setRichTextMode(false)}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {open &&
          <RichEditor 
            initialValue={content} 
            onChange={onChange}
            withToolbar
            editorStyle={editorStyle}
          />
        }
        <DialogActions>
          <Button onClick={handleApply}>Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

