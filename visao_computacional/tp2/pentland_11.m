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
slant = degtorad(85);
tilt = degtorad(55);

if (isPepper == 1)
    slant = degtorad(76);
    tilt = degtorad(35);
end

%Modo 2 de calcular 
[x,y] = meshgrid(1:N, 1:M);

%preenchemos uma matriz discretizada com vários valores para wx e wy
sinSlant = sin(slant);
wx = (2.*pi*sinSlant.*x) ./ N;
wy = (2.*pi*sinSlant.*y) ./ M;

k1 = cos(tilt) * sin(slant);
k2 = sin(tilt) * sin(slant);

%criar uma matriz para s que tem todas as frequencias.
angleX = (2.*pi.*x) ./ N;
angleY = (2.*pi.*y) ./ M;

s = sign(cos(tilt - (angleX + angleY)));

% 0.5 < d < 0.75
d = 0.5; %se coloco um d < que 0.5 o ruido fica menor e a imagem tende a ficar melhor ?

Fz2 = (abs(Fi) ./ (s*d + (k1*wx + k2*wy))) .* exp(1i*(angle(Fi) - pi/2));

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
