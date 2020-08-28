function [value] = delta(val, m)    
   
    if (nargin ~= 1 && nargin ~= 2)
        disp ("Faltando parametro");
    end

    value = zeros (size (val), class (val));
    value(find(val == m)) = 1;

    value(isnan (val)) = NaN;
end