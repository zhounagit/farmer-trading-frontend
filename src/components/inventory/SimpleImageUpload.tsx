import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Snackbar,
  Grid,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  Star,
  PhotoCamera,
  Visibility,
  Close,
} from '@mui/icons-material';

export interface InventoryImage {
  imageId?: number;
  itemId: number;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  widthPixels?: number;
  heightPixels?: number;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
  caption?: string;
  uploadedAt?: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
}

interface SimpleImageUploadProps {
  itemId: number;
  onImagesChange: (images: InventoryImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
}

const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  itemId,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
}) => {
  const [images, setImages] = useState<InventoryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<InventoryImage | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<InventoryImage | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      return 'Supported formats: JPEG, PNG, WebP, GIF';
    }

    return null;
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if we can upload more images
    if (images.length + files.length > maxImages) {
      showSnackbar(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newImages: InventoryImage[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        showSnackbar(`${file.name}: ${validationError}`, 'error');
        failed++;
        continue;
      }

      try {
        // Create a mock image object (in real app, this would upload to server)
        const mockImage: InventoryImage = {
          imageId: Date.now() + Math.random(), // Mock ID
          itemId,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
          isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
          displayOrder: images.length + newImages.length,
          altText: '',
          caption: '',
          uploadedAt: new Date().toISOString(),
          originalUrl: URL.createObjectURL(file), // Create blob URL for preview
          thumbnailUrl: URL.createObjectURL(file),
          mediumUrl: URL.createObjectURL(file),
          largeUrl: URL.createObjectURL(file),
        };

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          mockImage.widthPixels = img.width;
          mockImage.heightPixels = img.height;
        };
        img.src = mockImage.originalUrl!;

        newImages.push(mockImage);
        successful++;

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error('Error processing file:', file.name, error);
        failed++;
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);

    setUploading(false);
    setUploadProgress(0);

    if (successful > 0 && failed === 0) {
      showSnackbar(`${successful} image${successful > 1 ? 's' : ''} uploaded successfully`, 'success');
    } else if (successful > 0 && failed > 0) {
      showSnackbar(`${successful} uploaded, ${failed} failed`, 'warning');
    } else if (failed > 0) {
      showSnackbar(`Failed to upload ${failed} image${failed > 1 ? 's' : ''}`, 'error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, itemId, maxImages, maxFileSize, onImagesChange]);

  const handleDeleteImage = (imageId: number) => {
    const updatedImages = images.filter(img => img.imageId !== imageId);

    // Reassign display orders
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      displayOrder: index,
    }));

    // If we deleted the primary image, make the first one primary
    if (reorderedImages.length > 0 && !reorderedImages.some(img => img.isPrimary)) {
      reorderedImages[0].isPrimary = true;
    }

    setImages(reorderedImages);
    onImagesChange(reorderedImages);
    showSnackbar('Image deleted successfully', 'success');
  };

  const handleSetPrimary = (imageId: number) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.imageId === imageId,
    }));

    setImages(updatedImages);
    onImagesChange(updatedImages);
    showSnackbar('Primary image updated', 'success');
  };

  const handleEditImage = (image: InventoryImage) => {
    setEditingImage({ ...image });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingImage) return;

    const updatedImages = images.map(img =>
      img.imageId === editingImage.imageId ? editingImage : img
    );

    setImages(updatedImages);
    onImagesChange(updatedImages);
    setEditDialogOpen(false);
    setEditingImage(null);
    showSnackbar('Image details updated', 'success');
  };

  const handlePreviewImage = (image: InventoryImage) => {
    setPreviewImage(image);
    setPreviewDialogOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Product Images
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload up to {maxImages} images. First image will be the primary product photo.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          Upload Images
        </Button>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading images...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Images grid */}
      {images.length === 0 ? (
        <Card
          sx={{
            border: '2px dashed #ccc',
            backgroundColor: 'grey.50',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PhotoCamera sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No images uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click here or use the "Upload Images" button to add product photos
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.imageId}>
              <Card sx={{ position: 'relative' }}>
                {/* Primary badge */}
                {image.isPrimary && (
                  <Chip
                    label="Primary"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Image */}
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${image.originalUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePreviewImage(image)}
                />

                {/* Actions */}
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="body2" noWrap title={image.fileName}>
                    {image.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(image.fileSizeBytes)}
                    {image.widthPixels && image.heightPixels &&
                      ` • ${image.widthPixels}x${image.heightPixels}`
                    }
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewImage(image)}
                        title="Preview"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditImage(image)}
                        title="Edit details"
                      >
                        <Edit />
                      </IconButton>
                      {!image.isPrimary && (
                        <IconButton
                          size="small"
                          onClick={() => handleSetPrimary(image.imageId!)}
                          title="Set as primary"
                        >
                          <Star />
                        </IconButton>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(image.imageId!)}
                      color="error"
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Usage info */}
      {images.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {images.length} of {maxImages} images uploaded.
          {images.length < maxImages && ' You can upload ' + (maxImages - images.length) + ' more.'}
        </Alert>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Image Details</DialogTitle>
        <DialogContent>
          {editingImage && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Alt Text"
                value={editingImage.altText || ''}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, altText: e.target.value })
                }
                placeholder="Describe the image for accessibility"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Caption"
                value={editingImage.caption || ''}
                onChange={(e) =>
                  setEditingImage({ ...editingImage, caption: e.target.value })
                }
                placeholder="Optional caption for the image"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingImage.isPrimary}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // If setting as primary, update all other images
                        const updatedImages = images.map(img => ({
                          ...img,
                          isPrimary: img.imageId === editingImage.imageId,
                        }));
                        setImages(updatedImages);
                      }
                      setEditingImage({ ...editingImage, isPrimary: e.target.checked });
                    }}
                  />
                }
                label="Set as primary image"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Image Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {previewImage?.fileName}
          </Typography>
          <IconButton onClick={() => setPreviewDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box>
              <Box
                component="img"
                src={previewImage.originalUrl}
                alt={previewImage.altText || previewImage.fileName}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  mb: 2,
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={formatFileSize(previewImage.fileSizeBytes)} size="small" />
                {previewImage.widthPixels && previewImage.heightPixels && (
                  <Chip
                    label={`${previewImage.widthPixels}x${previewImage.heightPixels}`}
                    size="small"
                  />
                )}
                <Chip label={previewImage.mimeType} size="small" />
                {previewImage.isPrimary && (
                  <Chip label="Primary Image" color="primary" size="small" />
                )}
              </Box>
              {previewImage.caption && (
                <Typography variant="body2" color="text.secondary">
                  {previewImage.caption}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SimpleImageUpload;
