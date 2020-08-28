function y = heaviside (x, zero_value)
  if ~exist('arg2', 'var')
     zero_value = 0.5;
  end

  if (nargin < 1)
    disp("Faltando parametro");
    return;
  end

  y = cast (x > 0, class (x));
  y (x == 0) = zero_value;
end

