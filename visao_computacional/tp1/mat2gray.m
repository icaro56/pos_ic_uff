function I = mat2gray (M, scale)

    if (nargin < 1|| nargin > 2)
        disp ("mat2gray(...) number of arguments must be 1 or 2");
        return;
    end

    if (~(ismatrix(M)))
        disp ("mat2gray(M,...) M must be a matrix");
        return;
    end

    if (nargin == 1)
        Mmin = min (min (M));
        Mmax = max (max (M));
    else 
        if (isvector (scale))
            Mmin = min (scale (1), scale (2));
            Mmax = max (scale (1), scale (2));
        end
    end

    I = (M < Mmin) .* 0;
    I = I + (M >= Mmin & M < Mmax) .* (1 / (Mmax - Mmin) * (M - Mmin));
    I = I + (M >= Mmax);

end