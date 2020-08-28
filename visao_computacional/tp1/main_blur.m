
%L� a imagem original do arquivo
originalImage = imread('ferrari.jpg');

%Recupera s� um canal da imagem caso a imagem n�o esteja em tons de cinza
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

sigma = 3;
m = kernelPSFSize/2;
[X, Y] = meshgrid(1:kernelPSFSize);

%Calculamos a fun��o de espalhamento do ponto aqui
kernelPSF = (1/(2*pi*sigma^2)) * exp(-((X-m).^2 + (Y-m).^2)/(2*sigma^2));

%Adicionamos um pad na imagem para evitar problemas nas bordas
originalImagePad = padimage(originalImage, kernelPSFSize);

%recuperamos a altura e largura da imagem original
[originalHeight, originalWidth] = size(originalImage);

%recuperamos a altura e largura da imagem com pad
[height, width] = size(originalImagePad);
%criamos a imagem do kernel com mesma altura e largura da imagem original
kernelImage = zeros(height, width);
%adicionamos o kernelPSF no in�cio do kernelImagem. Poderia ser colocado no
%meio tamb�m ou no final
kernelImage(1:kernelPSFSize, 1:kernelPSFSize) = kernelPSF;

%convertemos a imagem para o dom�nio da frequ�ncia
fftImage = fft2(originalImagePad);
%convertemos o kernel para o dom�nio da frequ�ncia
fftKernel = fft2(kernelImage);

%recurso t�cnico para poder recuperar a imagem. Sen�o pode ocorrer divis�o
%por zero
fftKernel(find(fftKernel == 0)) = 1e-6;

%aplicamos a multiplica��o no dom�nio da frequ�ncia para obtermos a imagem
%borrada no dom�nio da frequ�ncia
fftBlurImage = fftImage.*fftKernel;

%desenhamos as imagens no dom�nio da frequ�ncia
subplot(3,3,2);
fftImageToShow = fftshift(fftImage);
fftImageToShow = abs(fftImageToShow);
fftImageToShow = log(fftImageToShow+1);
imagesc(fftImageToShow);
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

%fazemos a Inverse Fast Fourier Transform para obter a imagem no dom�nio
%espacial
blurImage = ifft2(fftBlurImage());

%Removemos o pad adicionado no in�cio
blurImageUnpad = blurImage(kernelPSFSize+16:kernelPSFSize+originalHeight+15.5,kernelPSFSize+16:kernelPSFSize+originalWidth+15.5);

%figure;
subplot(3,3,4);
imagesc(blurImageUnpad);
axis square;
title('Borramento Gaussiano');
colormap gray;
set(gca, 'XTick', [], 'YTick', []);

%Tentando recuperar a imagem degradada com a formula H' = 1/H
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
