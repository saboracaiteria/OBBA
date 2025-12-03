import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';

interface ImageCropModalProps {
    imageUrl: string;
    aspectRatio?: number; // e.g., 1 for square, 16/9 for banner
    onComplete: (croppedFile: File) => void;
    onCancel: () => void;
    title?: string;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    imageUrl,
    aspectRatio = 1,
    onComplete,
    onCancel,
    title = 'Recortar Imagem'
}) => {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 90,
        height: aspectRatio === 1 ? 90 : 90 / aspectRatio,
        x: 5,
        y: 5
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const getCroppedImg = async (): Promise<File | null> => {
        if (!completedCrop || !imgRef.current) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }
                const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleComplete = async () => {
        const croppedFile = await getCroppedImg();
        if (croppedFile) {
            onComplete(croppedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="flex justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                        >
                            <img
                                ref={imgRef}
                                src={imageUrl}
                                alt="Crop preview"
                                className="max-w-full max-h-[60vh] object-contain"
                            />
                        </ReactCrop>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t bg-white">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleComplete}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
