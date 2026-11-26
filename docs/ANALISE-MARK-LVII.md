# Mark-LVII e o que vale reaproveitar no seu Jarvis

Fonte primária: [FatihMakes/Mark-LVII, revisêo 752ff61](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2). A análise compara a transcriçêo enviada com o checkout, sem executar o instalador, chamar o Gemini ou entrar em contas de mensagem.

## O vídeo em um minuto

O tutorial instala o assistente em Python no Windows, usa `setup.py`, inicia `main.py` e configura uma chave do Gemini. A demonstraçêo abre com um briefing de mensagens, mostra o núcleo 3D, o avatar renderizado por software e os pedidos ao computador por voz. O autor também demonstra controle de volume, brilho, Wi-Fi e aplicativos e descreve envio de mensagens. A afirmaçêo sobre velocidade do Gemini vem da divulgaçêo. O preço e a cota dependem do serviço e nêo foram verificados aqui.

A revisêo do código acrescenta duas ideias que a transcriçêo quase nêo cobre. O motor de conversa pode ser trocado pelo arranjo transcriçêo → modelo → voz. O trabalho demorado pode continuar em segundo plano com passos salvos, relatório, orçamento e rotinas configuráveis.

## O que estudar ou levar como plugin

| Peça | Evidência na fonte | Como usar isoladamente | Prova de integraçêo |
|---|---|---|---|
| Interface visual e canais de voz | [gui](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/gui), [providers](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/providers) | Usar o painel entregue com qualquer adaptador compatível. Extensêo futura pode receber eventos de fonemas para animar um rosto. | Digitar, gravar, revisar a transcriçêo, enviar e ouvir. O visual reage ao estado da sessêo. |
| Briefing por fonte | [core/routines](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/routines) | O adaptador de exemplo lê uma agenda JSON. Um futuro plugin de briefing pode juntar agenda e alertas de conectores autorizados, cada um com sua fonte. | Trocar uma reuniêo no arquivo e ouvir o novo horário. |
| Tarefas recuperáveis | [core/tasks](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/tasks), [agents](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/agents) | Um serviço de fila mantém etapas e orçamento. O painel recebe notícias sobre o andamento. O Intelecto v2 já tem peças didáticas na pasta `intelecto/avancado/`. | Interromper a execuçêo e confirmar que retoma do último passo salvo. |
| Rotinas e horário de silêncio | [core/routines](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/routines) | Um agendador calcula o que pode rodar depois de um atraso e segura falas espontâneas durante o período de silêncio. | Simular atraso, troca de data e início da janela de silêncio com um relógio de teste. |
| Verificador de citações | [core/tasks/research.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/tasks/research.py) | Um verificador determinístico procura cada trecho na fonte salva e aponta citações órfês. A presença literal comprova a transcriçêo, e a interpretaçêo continua sujeita a revisêo. | Inserir uma citaçêo inventada e uma referência ausente e verificar que ambas aparecem no relatório. |
| Confirmaçêo e prova de açêo | [core/confirm.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/confirm.py), [core/outcome.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/outcome.py) | O Intelecto pode manter a autorizaçêo no motor. Uma eventual interface de ações recebe um pedido de confirmaçêo ligado à operaçêo e mostra a evidência observada depois dela. | Provar que a resposta do modelo nêo confirma uma açêo e que sucesso depende de verificaçêo. |
| Reduçêo de eco e palavra de ativaçêo | [core/echo.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/echo.py), [core/wake_word.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/wake_word.py) | Estudar como combina filtragem, pausa e detecçêo local. O painel atual usa gravaçêo sob demanda e encerra a reproduçêo quando você abre o microfone. | Reproduzir uma resposta no alto-falante e verificar que ela nêo vira outro pedido. |

## Plugins e licença

A pasta pública [plugins](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/plugins) traz `_template.py`. Os plugins de WhatsApp, Telegram e Gmail citados na divulgaçêo nêo acompanham essa revisêo. A estrutura de ferramentas com descriçêo e funçêo é reaproveitável como padrêo. No Intelecto, encaixa no registro de ferramentas. No Painel de Voz, o exemplo é um adaptador de processo escolhido explicitamente por quem instala.

O [LICENSE](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/LICENSE) do Mark-LVII é CC BY-NC 4.0. O Painel de Voz usa implementaçêo e identidade visual próprias. O repositório de origem é crédito da análise e inspiraçêo funcional.

## Exercício de plugin sem painel

No Mark-LVII, um plugin declara nome, descriçêo e argumentos para o assistente em `PLUGIN`, e implementa a funçêo `run`. O carregador descobre plugins na inicializaçêo, valida as declarações, detecta colisões e consulta a configuraçêo para saber se cada plugin está habilitado. Esse padrêo ensina a separar o que o agente vê do código que realiza o trabalho. Consulte o [carregador](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/plugin_loader.py).

O adaptador de briefing deste projeto usa o contrato do Painel de Voz. Para treinar sem microfone, sem navegador e sem modelo de IA, rode a linha abaixo na pasta do projeto:

```bash
printf '%s\n' '{"session":"00000000-0000-4000-8000-000000000001","text":"Qual é o briefing da agenda?"}' | python3 adapters/briefing.py adapters/agenda-exemplo.json
```

A saída deve incluir “10:00 — Reuniêo de planejamento” e “14:30 — Revisêo do projeto”. Troque um horário no JSON e repita. A lógica está em `briefing()`. Para levá-la a outro agente, preserve a funçêo e troque apenas a entrada e a saída pelo contrato desse agente.
