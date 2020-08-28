function Ipad = padimage( I, p )
[h, w] = size(I); 

%Pad edges
Ipad = zeros(h+2*p, w+2*p);  

%para fazer pad com cor preta
%sz = size(I);
%Ipad = zeros([sz(1:2)+2*p size(I,3)], class(I));
%Ipad((1:sz(1))+p, (1:sz(2))+p, :) = I;
%----------------------------------------------------

%Meio
Ipad(p+1:p+h, p+1:p+w) = I;

%Superior e Inferior
Ipad(1:p, p+1:p+w) = repmat(I(1,1:end), p, 1);
Ipad(p+h+1:end, p+1:p+w) = repmat(I(end,1:end), p, 1); 

%Esquerda e Direita
Ipad(p+1:p+h, 1:p) = repmat(I(1:end,1), 1, p);
Ipad(p+1:p+h, p+w+1:end) = repmat(I(1:end,end), 1, p); 

%Cantos
Ipad(1:p, 1:p) = I(1,1); %Superior-esquerdo
Ipad(1:p, p+w+1:end) = I(1,end); %Superior-direito
Ipad(p+h+1:end, 1:p) = I(end,1); %Inferior-esquerdo
Ipad(p+h+1:end,p+w+1:end) = I(end,end); %Inferior-direito

end

