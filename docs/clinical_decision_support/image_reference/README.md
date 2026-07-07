# Referências visuais dos exercícios

A prancha `pilates_exercise_reference_sheet.svg` contém ilustrações esquemáticas próprias para referência interna do PilatesVision.

## Por que SVG?

- É texto versionável no GitHub.
- Não copia fotos comerciais de escolas ou estúdios.
- Pode ser usado como placeholder seguro no app.
- Permite evolução futura para imagens anatômicas melhores, vídeos curtos ou frames anotados.

## Diretriz

As imagens são referências visuais didáticas. Não substituem demonstração profissional, correção presencial ou avaliação clínica.

## Mapeamento

O campo `image_ref` do `exercise_catalog.csv` aponta para o arquivo SVG e para um identificador interno. Exemplo:

`image_reference/pilates_exercise_reference_sheet.svg#mat_hundred`

No front-end, o ideal é usar a prancha como referência inicial e futuramente substituir por assets individuais validados.
