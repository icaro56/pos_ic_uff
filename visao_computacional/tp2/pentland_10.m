clear all;

%Lê a imagem original do arquivo
isPepper = 0;
filename1 = 'pepper256.png';
filename2 = 'lena.png';

if (isPepper == 1)
    filename = filename1;
else
    filename = filename2;
end

I = imread(filename);

%Recupera só um canal da imagem caso a imagem não esteja em tons de cinza
if size(I, 3) == 3
    I = double(rgb2gray(I));
else
    I = double(mat2gray(I));
end

%configurando plot
originalImage = I;
figure(1);
subplot(1,2,1);
imagesc(originalImage);
axis square;
colormap gray(256);
title('Imagem Original');
set(gca, 'XTick', [], 'YTick', []);

%transformada de Fourier de I
Fi = fft2(I);

%recuperamos o número de linhas e colunas da imagem
[M, N] = size(I);

%damos valor para os angulos slant e tilt
slant = degtorad(22);
tilt = degtorad(30);

if (isPepper == 1)
    slant = degtorad(1);
    tilt = degtorad(20);
end

%Modo 2 de calcular 
[x,y] = meshgrid(1:N, 1:M);

%preenchemos uma matriz discretizada com vários valores para wx e wy
wx = (2.*pi.*x) ./ N;
wy = (2.*pi.*y) ./ M;

k1 = cos(tilt) * sin(slant);
k2 = sin(tilt) * sin(slant);
F3 = abs(Fi);
Fz2 = (abs(Fi) ./ (k1*wx + k2*wy)) .* exp(1i*(angle(Fi) - pi/2));

%computamos a transformada inversa de fourier para recuperar a superfície
Z2 = abs(ifft2(Fz2));

subplot(1,2,2);
mySurf =surfl(Z2);
h = rotate3d;
h.RotateStyle = 'box';
h.Enable = 'on';
colormap gray(256);
title('Reconstrução');
shading faceted;
set(gca,'Ydir','reverse');
set(gca,'Xdir','normal');
set(gca,'Zdir','normal');
%camlight('headlight');
set(mySurf,'LineStyle',':');
mySurf.EdgeColor = [0.9 0.9 0.9];
mySurf.FaceColor = 'flat';
