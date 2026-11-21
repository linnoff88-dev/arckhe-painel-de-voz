# Mark-LVII e o que vale reaproveitar no seu Jarvis

Fonte primária: [FatihMakes/Mark-LVII, revisão 752ff61](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2). A análise compara a transcrição enviada com o checkout, sem executar o instalador, chamar o Gemini ou entrar em contas de mensagem.

## O vídeo em um minuto

O tutorial instala o assistente em Python no Windows, usa `setup.py`, inicia `main.py` e configura uma chave do Gemini. A demonstração abre com um briefing de mensagens, mostra o núcleo 3D, o avatar renderizado por software e os pedidos ao computador por voz. O autor também demonstra controle de volume, brilho, Wi-Fi e aplicativos e descreve envio de mensagens. A afirmação sobre velocidade do Gemini vem da divulgação. O preço e a cota dependem do serviço e não foram verificados aqui.

A revisão do código acrescenta duas ideias que a transcrição quase não cobre. O motor de conversa pode ser trocado pelo arranjo transcrição → modelo → voz. O trabalho demorado pode continuar em segundo plano com passos salvos, relatório, orçamento e rotinas configuráveis.

## O que estudar ou levar como plugin

| Peça | Evidência na fonte | Como usar isoladamente | Prova de integração |
|---|---|---|---|
| Interface visual e canais de voz | [gui](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/gui), [providers](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/providers) | Usar o painel entregue com qualquer adaptador compatível. Extensão futura pode receber eventos de fonemas para animar um rosto. | Digitar, gravar, revisar a transcrição, enviar e ouvir. O visual reage ao estado da sessão. |
| Briefing por fonte | [core/routines](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/routines) | O adaptador de exemplo lê uma agenda JSON. Um futuro plugin de briefing pode juntar agenda e alertas de conectores autorizados, cada um com sua fonte. | Trocar uma reunião no arquivo e ouvir o novo horário. |
| Tarefas recuperáveis | [core/tasks](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/tasks), [agents](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/agents) | Um serviço de fila mantém etapas e orçamento. O painel recebe notícias sobre o andamento. O Intelecto v2 já tem peças didáticas na pasta `intelecto/avancado/`. | Interromper a execução e confirmar que retoma do último passo salvo. |
| Rotinas e horário de silêncio | [core/routines](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/core/routines) | Um agendador calcula o que pode rodar depois de um atraso e segura falas espontâneas durante o período de silêncio. | Simular atraso, troca de data e início da janela de silêncio com um relógio de teste. |
| Verificador de citações | [core/tasks/research.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/tasks/research.py) | Um verificador determinístico procura cada trecho na fonte salva e aponta citações órfãs. A presença literal comprova a transcrição, e a interpretação continua sujeita a revisão. | Inserir uma citação inventada e uma referência ausente e verificar que ambas aparecem no relatório. |
| Confirmação e prova de ação | [core/confirm.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/confirm.py), [core/outcome.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/outcome.py) | O Intelecto pode manter a autorização no motor. Uma eventual interface de ações recebe um pedido de confirmação ligado à operação e mostra a evidência observada depois dela. | Provar que a resposta do modelo não confirma uma ação e que sucesso depende de verificação. |
| Redução de eco e palavra de ativação | [core/echo.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/echo.py), [core/wake_word.py](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/wake_word.py) | Estudar como combina filtragem, pausa e detecção local. O painel atual usa gravação sob demanda e encerra a reprodução quando você abre o microfone. | Reproduzir uma resposta no alto-falante e verificar que ela não vira outro pedido. |

## Plugins e licença

A pasta pública [plugins](https://github.com/FatihMakes/Mark-LVII/tree/752ff618a4e6a4bf2e675866b993071d739cfce2/plugins) traz `_template.py`. Os plugins de WhatsApp, Telegram e Gmail citados na divulgação não acompanham essa revisão. A estrutura de ferramentas com descrição e função é reaproveitável como padrão. No Intelecto, encaixa no registro de ferramentas. No Painel de Voz, o exemplo é um adaptador de processo escolhido explicitamente por quem instala.

O [LICENSE](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/LICENSE) do Mark-LVII é CC BY-NC 4.0. O Painel de Voz usa implementação e identidade visual próprias. O repositório de origem é crédito da análise e inspiração funcional.

## Exercício de plugin sem painel

No Mark-LVII, um plugin declara nome, descrição e argumentos para o assistente em `PLUGIN`, e implementa a função `run`. O carregador descobre plugins na inicialização, valida as declarações, detecta colisões e consulta a configuração para saber se cada plugin está habilitado. Esse padrão ensina a separar o que o agente vê do código que realiza o trabalho. Consulte o [carregador](https://github.com/FatihMakes/Mark-LVII/blob/752ff618a4e6a4bf2e675866b993071d739cfce2/core/plugin_loader.py).

O adaptador de briefing deste projeto usa o contrato do Painel de Voz. Para treinar sem microfone, sem navegador e sem modelo de IA, rode a linha abaixo na pasta do projeto:

```bash
printf '%s\n' '{"session":"00000000-0000-4000-8000-000000000001","text":"Qual é o briefing da agenda?"}' | python3 adapters/briefing.py adapters/agenda-exemplo.json
```

A saída deve incluir “10:00 — Reunião de planejamento” e “14:30 — Revisão do projeto”. Troque um horário no JSON e repita. A lógica está em `briefing()`. Para levá-la a outro agente, preserve a função e troque apenas a entrada e a saída pelo contrato desse agente.
