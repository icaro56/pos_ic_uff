%Lê a imagem original do arquivo
originalImage = imread('cachorro.jpg');

%Recupera só um canal da imagem caso a imagem não esteja em tons de cinza
%originalImage = originalImage(:, :, 1);

%configurando plot
figure;
imagesc(originalImage);
axis square;
colormap gray;
title('Imagem Original');
set(gca, 'XTick', [], 'YTick', []);

kernelPSFSize = 31;
kernelPSF = zeros(kernelPSFSize);

sigma = 3;
m = kernelPSFSize/2;
[X, Y] = meshgrid(1:kernelPSFSize);

kernelPSF = (1/(2*pi*sigma^2)) * exp(-((X-m).^2 + (Y-m).^2)/(2*sigma^2));

%Adicionamos um pad na imagem para evitar problemas nas bordas
originalImagePad = padimage(originalImage, kernelPSFSize);
figure;
imagesc(originalImagePad);
axis square;
colormap gray;
title('Imagem Pad');
set(gca, 'XTick', [], 'YTick', []);