import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  Star,
  MoreVert,
  DragIndicator,
  Image as ImageIcon,
  Visibility,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export interface InventoryImage {
  image_id?: number;
  item_id: number;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  width_pixels?: number;
  height_pixels?: number;
  is_primary: boolean;
  display_order: number;
  alt_text?: string;
  caption?: string;
  original_url?: string;
  thumbnail_key?: string;
  medium_size_key?: string;
  large_size_key?: string;
  uploaded_at?: string;
}

export interface ImageUploadFile extends File {
  preview?: string;
  uploadProgress?: number;
  uploadError?: string;
  tempId?: string;
}

interface ImageUploadManagerProps {
  itemId?: number;
  existingImages?: InventoryImage[];
  onImagesChange: (images: InventoryImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  disabled?: boolean;
}

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  itemId,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
}) => {
  const [images, setImages] = useState<InventoryImage[]>(existingImages);
  const [uploadingFiles, setUploadingFiles] = useState<ImageUploadFile[]>([]);
  const [editingImage, setEditingImage] = useState<InventoryImage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<InventoryImage | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop and selection
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const validFiles = acceptedFiles.filter((file) => {
        if (!acceptedFileTypes.includes(file.type)) {
          showSnackbar(`File ${file.name} is not a supported image format`);
          return false;
        }
        if (file.size > maxFileSize) {
          showSnackbar(
            `File ${file.name} is too large (max ${maxFileSize / 1024 / 1024}MB)`
          );
          return false;
        }
        return true;
      });

      if (
        images.length + uploadingFiles.length + validFiles.length >
        maxImages
      ) {
        showSnackbar(`Cannot upload more than ${maxImages} images`);
        return;
      }

      const filesWithPreview: ImageUploadFile[] = validFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          uploadProgress: 0,
          tempId: `temp_${Date.now()}_${Math.random()}`,
        });
        return fileWithPreview;
      });

      setUploadingFiles((prev) => [...prev, ...filesWithPreview]);

      // Start uploading files
      filesWithPreview.forEach(uploadFile);
    },
    [
      images,
      uploadingFiles,
      maxImages,
      maxFileSize,
      acceptedFileTypes,
      disabled,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes
        .map((type) => type.split('/')[1])
        .map((ext) => `.${ext}`),
    },
    multiple: true,
    disabled,
  });

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const uploadFile = async (file: ImageUploadFile) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('itemId', itemId?.toString() || '');

      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.tempId === file.tempId ? { ...f, uploadProgress: progress } : f
          )
        );
      };

      // Simulate upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        updateProgress(progress);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Mock API call - replace with actual API
      const response = await mockUploadImage(file, itemId);

      if (response.success) {
        const newImage: InventoryImage = {
          image_id: response.image_id,
          item_id: itemId || 0,
          file_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type,
          is_primary: images.length === 0, // First image is primary
          display_order: images.length,
          alt_text: '',
          caption: '',
          original_url: response.url,
          thumbnail_key: response.thumbnail_key,
          medium_size_key: response.medium_size_key,
          large_size_key: response.large_size_key,
          uploaded_at: new Date().toISOString(),
        };

        setImages((prev) => {
          const updated = [...prev, newImage];
          onImagesChange(updated);
          return updated;
        });

        setUploadingFiles((prev) =>
          prev.filter((f) => f.tempId !== file.tempId)
        );
        showSnackbar(`Image ${file.name} uploaded successfully`);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.tempId === file.tempId
            ? {
                ...f,
                uploadError:
                  error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
      showSnackbar(`Failed to upload ${file.name}`);
    }
  };

  // Mock API function - replace with actual API call
  const mockUploadImage = async (
    file: File,
    itemId?: number
  ): Promise<{
    success: boolean;
    image_id?: number;
    url?: string;
    thumbnail_key?: string;
    medium_size_key?: string;
    large_size_key?: string;
    error?: string;
  }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      image_id: Math.floor(Math.random() * 10000),
      url: URL.createObjectURL(file),
      thumbnail_key: `thumb_${file.name}`,
      medium_size_key: `med_${file.name}`,
      large_size_key: `large_${file.name}`,
    };
  };

  const handleSetPrimary = (imageId: number) => {
    setImages((prev) => {
      const updated = prev.map((img) => ({
        ...img,
        is_primary: img.image_id === imageId,
      }));
      onImagesChange(updated);
      return updated;
    });
    showSnackbar('Primary image updated');
  };

  const handleDeleteImage = () => {
    try {
      // Mock API call - replace with actual API
      await mockDeleteImage(imageId);

      setImages((prev) => {
        const updated = prev.filter((img) => img.image_id !== imageId);
        // If we deleted the primary image, make the first remaining image primary
        if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
          updated[0].is_primary = true;
        }
        onImagesChange(updated);
        return updated;
      });
      showSnackbar('Image deleted successfully');
    } catch (error) {
      showSnackbar('Failed to delete image');
    }
  };

  const mockDeleteImage = async (imageId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleReorderImages = (result: any) => {
    if (!result.destination || disabled) return;

    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);

    // Update display_order
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      display_order: index,
    }));

    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleEditImage = (image: InventoryImage) => {
    setEditingImage({ ...image });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      // Mock API call - replace with actual API
      await mockUpdateImage(editingImage);

      setImages((prev) => {
        const updated = prev.map((img) =>
          img.image_id === editingImage.image_id ? editingImage : img
        );
        onImagesChange(updated);
        return updated;
      });

      setEditDialogOpen(false);
      setEditingImage(null);
      showSnackbar('Image updated successfully');
    } catch (error) {
      showSnackbar('Failed to update image');
    }
  };

  const mockUpdateImage = async (image: InventoryImage): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handlePreviewImage = (image: InventoryImage) => {
    setPreviewImage(image);
    setPreviewDialogOpen(true);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    imageId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedImageId(imageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedImageId(null);
  };

  const retryUpload = (file: ImageUploadFile) => {
    setUploadingFiles((prev) =>
      prev.map((f) =>
        f.tempId === file.tempId
          ? { ...f, uploadError: undefined, uploadProgress: 0 }
          : f
      )
    );
    uploadFile(file);
  };

  const removeFailedUpload = (tempId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.tempId !== tempId));
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Product Images
      </Typography>

      {/* Upload Area */}
      {!disabled && images.length + uploadingFiles.length < maxImages && (
        <Card
          sx={{
            mb: 3,
            border: isDragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
            backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
          }}
        >
          <CardContent>
            <Box
              {...getRootProps()}
              sx={{
                textAlign: 'center',
                py: 4,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              <CloudUpload sx={{ fontSize: 48, color: '#666', mb: 2 }} />
              <Typography variant='h6' gutterBottom>
                {isDragActive
                  ? 'Drop images here'
                  : 'Drag & drop images here, or click to select'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Supports JPEG, PNG, WebP up to {maxFileSize / 1024 / 1024}MB
                each
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Maximum {maxImages} images total
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              Uploading Images
            </Typography>
            {uploadingFiles.map((file) => (
              <Box key={file.tempId} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant='body2' sx={{ flex: 1 }}>
                    {file.name}
                  </Typography>
                  {file.uploadError ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size='small'
                        onClick={() => retryUpload(file)}
                        variant='outlined'
                        color='primary'
                      >
                        Retry
                      </Button>
                      <Button
                        size='small'
                        onClick={() => removeFailedUpload(file.tempId!)}
                        variant='outlined'
                        color='error'
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant='body2'>
                      {file.uploadProgress}%
                    </Typography>
                  )}
                </Box>
                {file.uploadError ? (
                  <Alert severity='error' sx={{ mt: 1 }}>
                    {file.uploadError}
                  </Alert>
                ) : (
                  <LinearProgress
                    variant='determinate'
                    value={file.uploadProgress || 0}
                  />
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              Uploaded Images ({images.length}/{maxImages})
            </Typography>

            <DragDropContext onDragEnd={handleReorderImages}>
              <Droppable droppableId='images' direction='horizontal'>
                {(provided) => (
                  <Grid
                    spacing={2}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {images.map((image, index) => (
                      <Draggable
                        key={image.image_id}
                        draggableId={image.image_id!.toString()}
                        index={index}
                        isDragDisabled={disabled}
                      >
                        {(provided, snapshot) => (
                          <Grid
                            item
                            xs={6}
                            sm={4}
                            md={3}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Card
                              sx={{
                                position: 'relative',
                                transform: snapshot.isDragging
                                  ? 'rotate(5deg)'
                                  : undefined,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              {/* Primary Badge */}
                              {image.is_primary && (
                                <Chip
                                  label='Primary'
                                  color='primary'
                                  size='small'
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    zIndex: 1,
                                  }}
                                />
                              )}

                              {/* Drag Handle */}
                              {!disabled && (
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 40,
                                    zIndex: 1,
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    borderRadius: 1,
                                    p: 0.5,
                                  }}
                                >
                                  <DragIndicator sx={{ fontSize: 16 }} />
                                </Box>
                              )}

                              {/* More Options Menu */}
                              <IconButton
                                size='small'
                                onClick={(e) =>
                                  handleMenuOpen(e, image.image_id!)
                                }
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                  backgroundColor: 'rgba(255,255,255,0.8)',
                                }}
                                disabled={disabled}
                              >
                                <MoreVert sx={{ fontSize: 16 }} />
                              </IconButton>

                              {/* Image */}
                              <Box
                                sx={{
                                  height: 200,
                                  backgroundImage: `url(${image.original_url || image.thumbnail_key})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handlePreviewImage(image)}
                              />

                              {/* Image Info */}
                              <CardContent sx={{ p: 1 }}>
                                <Typography
                                  variant='caption'
                                  display='block'
                                  noWrap
                                >
                                  {image.file_name}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {Math.round(image.file_size_bytes / 1024)}KB
                                  {image.width_pixels &&
                                    image.height_pixels &&
                                    ` • ${image.width_pixels}×${image.height_pixels}`}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const image = images.find(
              (img) => img.image_id === selectedImageId
            );
            if (image) handlePreviewImage(image);
            handleMenuClose();
          }}
        >
          <Visibility sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem
          onClick={() => {
            const image = images.find(
              (img) => img.image_id === selectedImageId
            );
            if (image) handleEditImage(image);
            handleMenuClose();
          }}
          disabled={disabled}
        >
          <Edit sx={{ mr: 1 }} />
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedImageId) handleSetPrimary(selectedImageId);
            handleMenuClose();
          }}
          disabled={disabled}
        >
          <Star sx={{ mr: 1 }} />
          Set as Primary
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedImageId) handleDeleteImage(selectedImageId);
            handleMenuClose();
          }}
          disabled={disabled}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Image Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Image Details</DialogTitle>
        <DialogContent>
          {editingImage && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label='Alt Text'
                value={editingImage.alt_text || ''}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, alt_text: e.target.value })
                }
                margin='normal'
                helperText='Describe the image for accessibility'
              />
              <TextField
                fullWidth
                label='Caption'
                value={editingImage.caption || ''}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, caption: e.target.value })
                }
                margin='normal'
                helperText='Optional caption to display with the image'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingImage.is_primary}
                    onChange={(e) =>
                      setEditingImage({
                        ...editingImage,
                        is_primary: e.target.checked,
                      })
                    }
                  />
                }
                label='Set as primary image'
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon />
          Image Preview
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box>
              <Box
                component='img'
                src={previewImage.original_url}
                alt={previewImage.alt_text || previewImage.file_name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  mb: 2,
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='body2'>
                    <strong>File Name:</strong> {previewImage.file_name}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Size:</strong>{' '}
                    {Math.round(previewImage.file_size_bytes / 1024)}KB
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Type:</strong> {previewImage.mime_type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {previewImage.width_pixels && previewImage.height_pixels && (
                    <Typography variant='body2'>
                      <strong>Dimensions:</strong> {previewImage.width_pixels}×
                      {previewImage.height_pixels}px
                    </Typography>
                  )}
                  <Typography variant='body2'>
                    <strong>Primary:</strong>{' '}
                    {previewImage.is_primary ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Uploaded:</strong>{' '}
                    {previewImage.uploaded_at
                      ? new Date(previewImage.uploaded_at).toLocaleDateString()
                      : 'Unknown'}
                  </Typography>
                </Grid>
              </Grid>
              {previewImage.alt_text && (
                <Typography variant='body2' sx={{ mt: 1 }}>
                  <strong>Alt Text:</strong> {previewImage.alt_text}
                </Typography>
              )}
              {previewImage.caption && (
                <Typography variant='body2'>
                  <strong>Caption:</strong> {previewImage.caption}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ImageUploadManager;
