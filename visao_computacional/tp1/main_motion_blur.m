
%Lê a imagem original do arquivo
originalImage = imread('ferrari.jpg');

%Recupera só um canal da imagem caso a imagem não esteja em tons de cinza
%originalImage = originalImage(:, :, 1);

%configurando plot
figure;
subplot(3,3,1);
imagesc(originalImage);
axis square;
colormap gray;
title('Imagem Original');
set(gca, 'XTick', [], 'YTick', []);

kernelPSFSize = 31;
kernelPSF = zeros(kernelPSFSize);

lineLength = 30;
m = kernelPSFSize/2;
[X, Y] = meshgrid(1:kernelPSFSize);

%Calculamos a função de espalhamento do ponto aqui
deltaY = delta(Y, ceil(m));
kernelPSF = (1/(2*lineLength)) * (heaviside(X-m+lineLength) - heaviside(X-m-lineLength)).*deltaY;

%Adicionamos um pad na imagem para evitar problemas nas bordas
originalImagePad = padimage(originalImage, kernelPSFSize);

%recuperamos a altura e largura da imagem original
[originalHeight, originalWidth] = size(originalImage);

%recuperamos a altura e largura da imagem com pad
[height, width] = size(originalImagePad);
%criamos a imagem do kernel com mesma altura e largura da imagem original
kernelImage = zeros(height, width);
%adicionamos o kernelPSF no início do kernelImagem. Poderia ser colocado no
%meio também ou no final
kernelImage(1:kernelPSFSize, 1:kernelPSFSize) = kernelPSF;

%convertemos a imagem para o domínio da frequência
fftImage = fft2(originalImagePad);
%convertemos o kernel para o domínio da frequência
fftKernel = fft2(kernelImage);

%recurso técnico para poder recuperar a imagem. Senão pode ocorrer divisão
%por zero
fftKernel(find(fftKernel == 0)) = 1e-6;

%aplicamos a multiplicação no domínio da frequência para obtermos a imagem
%borrada no domínio da frequência
fftBlurImage = fftImage.*fftKernel;

%desenhamos as imagens no domínio da frequência
subplot(3,3,2);
fftImageTemp = fftshift(fftImage);
fftImageTemp = abs(fftImageTemp);
fftImageTemp = log(fftImageTemp+1);
imagesc(fftImageTemp);
axis square;
colormap gray;
title('Magnitude');
set(gca, 'XTick', [], 'YTick', []);

subplot(3,3,3);
imagesc(angle(fftshift(fftImage)),[-pi pi]);
axis square;
colormap gray
title('Fase')
set(gca, 'XTick', [], 'YTick', []);

subplot(3,3,5);
fftBlurImageToShow = fftshift(fftBlurImage);
fftBlurImageToShow = abs(fftBlurImageToShow);
fftBlurImageToShow = log(fftBlurImageToShow+1);
imagesc(fftBlurImageToShow);
axis square;
colormap gray;
title('Magnitude');
set(gca, 'XTick', [], 'YTick', []);

subplot(3,3,6);
imagesc(angle(fftshift(fftBlurImage)),[-pi pi]);
axis square;
colormap gray
title('Fase')
set(gca, 'XTick', [], 'YTick', []);

%fazemos a Inverse Fast Fourier Transform para obter a imagem no domínio
%espacial
blurImage = ifft2(fftBlurImage);

%Removemos o pad adicionado no início
blurImageUnpad = blurImage(kernelPSFSize+16:kernelPSFSize+originalHeight+15.5,kernelPSFSize+16:kernelPSFSize+originalWidth+15.5);

%figure;
subplot(3,3,4);
imagesc(blurImageUnpad);
axis square;
title('Borramento por movimento');
colormap gray;
set(gca, 'XTick', [], 'YTick', []);

%Tentando recuperar a imagem degradada
fftRecoverKernel = 1./fftKernel;
fftBlurImageToRecover = fft2(blurImage);
fftRecoverBlurImage = fftBlurImageToRecover.*fftRecoverKernel;
recoverImage = ifft2(fftRecoverBlurImage);
recoverImageUnpad = recoverImage(kernelPSFSize+1:kernelPSFSize+originalHeight,kernelPSFSize+1:kernelPSFSize+originalWidth);

subplot(3,3,7);
imagesc(recoverImageUnpad);
axis square;
title('Imagem Restaurada');
colormap gray;
set(gca, 'XTick', [], 'YTick', []);

subplot(3,3,8);
fftRecoverBlurImageToShow = fftshift(fftRecoverBlurImage); 
fftRecoverBlurImageToShow = abs(fftRecoverBlurImageToShow);
fftRecoverBlurImageToShow = log(fftRecoverBlurImageToShow+1);
imagesc(fftRecoverBlurImageToShow);
axis square;
colormap gray;
title('Magnitude');
set(gca, 'XTick', [], 'YTick', []);

subplot(3,3,9);
imagesc(angle(fftshift(fftRecoverBlurImage)),[-pi pi]);
axis square;
colormap gray
title('Fase')
set(gca, 'XTick', [], 'YTick', []);