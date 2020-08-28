%Modo 1 de calcular 
Fz = zeros(M, N);

for i=1:M
    for j=1:N
        Fz(i,j) = Fi(i,j) / (-1i * ((2 * pi * j / M) * cos(tilt).*sin(slant) + (2 * pi * i / M) * sin(tilt) * sin(slant)));
    end
end

%computamos a transformada inversa de fourier para recuperar a superfície
Z = abs(ifft2(Fz));

subplot(2,2,2);
surfl(Z);
shading interp;
h = rotate3d;
h.RotateStyle = 'box';
h.Enable = 'on';
colormap gray(256);
lighting phong;
%camlight('headlight');