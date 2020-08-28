function [value] = psfDesfocamento(X, Y, R)    
   
    if (nargin ~= 1 && nargin ~= 2 && nargin ~= 3)
        disp ("Faltando parametro");
    end

    [sizeX, sizeY] = size(X);
    offset = floor(sizeX / 2) + 1;
    disp(offset)
    
    result = (X-offset).^2 + (Y-offset).^2;
    
    value = zeros (size (X), class (X));
    
    value(find(result <= R^2)) = (1 / (pi * (R^2)));
    
end