Plano: Especificação DMS
Criar somente docs/specs/dms-spec.md, seguindo o modelo e descrevendo os requisitos e contratos desejados. As etapas de backend e frontend aparecerão como roteiro futuro no documento, mas não serão executadas agora.

Etapas

Reaproveitar as oito seções de spec-template.md: objetivo, escopo, requisitos funcionais e não funcionais, dados, APIs, arquitetura e plano de execução.
Diferenciar o estado atual do sistema — que oferece apenas GET /health — do comportamento-alvo; upload, listagem e download ainda não estão implementados.
Definir os metadados: identificador, nome original, tamanho em bytes, data ISO 8601 e dono. O caminho local do arquivo será interno e não será exposto pela API.
Detalhar os três contratos previstos: POST /upload, GET /documents filtrado por ownerId e GET /documents/:id/download, incluindo formatos de entrada e saída, headers e erros esperados.
Documentar o armazenamento local em storage com multer.diskStorage, metadados em memória, limite padrão de 10 MiB e allowlist MIME configurável, vazia por padrão.
Incluir etapas futuras de implementação, respeitando routes → controllers → services → repositories e o proxy /api do Vite. Essas etapas serão descritivas; nenhum arquivo de aplicação será alterado.
Conferir a especificação contra as instruções do projeto em copilot-instructions.md.
Decisões alinhadas

O único artefato desta tarefa será docs/specs/dms-spec.md; não haverá alterações de backend ou frontend.
ownerId será informado pelo cliente e servirá para associação e filtro, mas não representa autenticação ou autorização.
O limite padrão de upload será 10 MiB; a allowlist MIME poderá ser configurada e ficará vazia por padrão.
Arquivos ficarão no filesystem local; os metadados em memória serão perdidos ao reiniciar a aplicação.
Verificação

Conferir cobertura das oito seções do modelo e consistência entre requisitos, modelo de dados, contratos e códigos de erro.
Confirmar que o escopo continua restrito ao documento de especificação.
Este é o plano para revisão; o arquivo dms-spec.md ainda não foi criado neste modo de planejamento.