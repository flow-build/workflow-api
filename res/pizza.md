# Pizza Order

O pedido de pizza é um caso frequentemente utilizado para exemplificar diagramas de processo em BPMN.

Apresentamos aqui 2 exemplos de fluxos de pedido de pizza, para demonstrar os diferentes tipos de nós e algumas das principais funcionalidades do FlowBuild.

Alguns materiais disponíveis:
- coleção para postman com as rotas disponíveis neste projeto
- variáveis de ambiente para a coleção do postman
- diagrama BPMN do fluxo pizza1 e pizza2

## Geração de tokens

Para acessar a API, é necessário ter um token válido, os requisitos mínimos para gerar um token:

Algorithm: HS256

Payload (conteúdo mínimo)
- exp: timestamp
- actor_id: string
- claims: arrayOf(string)

Verify Signature Secret: 1234

Sugestão: https://jwt.io/

---

## Pizza 1

Este fluxo é composto por 7 nós em uma única lane.
A lane exige somente um token válido, não expirado.

Cada nó tem apresenta diferentes recursos do flowBuild.
Todos os nós são tarefas de sistema do tipo setToBag, que tem como objetivo persistir dados no processo.

#### Node 2
Guarda os dados do pedido e apresenta o intérprete $ref que nos permite referenciar dados que estejam no token (actor_data), no result ou bag do processo.

#### Node 3
Apresenta o intérprete $js, que permite executar uma função javascript - nesse caso específico gerar um número aleatório.

#### Node 4
Apresenta um timerNode, que para o processo pela quantidade de segundos descrita no campo timeout

#### Node 5
Apresenta o intérprete [$mustache](http://mustache.github.io/)

#### Node 6
Outra demonstração do intérprete $ref

---

## Pizza 2

Este fluxo é composto por 12 nós em 2 lanes.
A lane 1, assim como no Pizza 1, exige somente um token válido, não expirado.
A lane 2 necessita que o token utilizado contenha, no campo **claims** a string *restaurant*

Abaixo o que apresentamos em cada nó.

### Node 2
Apresenta uma UserTask. O processo fica parado, esperando a conclusão da tarefa, registrada através da chamada /submit.
É esperado que na submissão da tarefa os campos qty, flavors e comments sejam enviados.

### Node 3
Apresenta uma chamada HTTP, que pode ser utilizado para integrar com qualquer tipo de serviço via chamada REST.
Demonstra a aplicação prática do intérprete $ref.
O endpoint utilizado representa uma simples demonstração criada em https://mockapi.io/

### Node 4
Apresenta a aplicação prática de um setToBag. Guarda na bag do processo a resposta da request do nó anterior.

### Node 5
Nova userTask, porém no necessita que o token utilizada cumpra as regras da lane 2.

### Node 6
Repete uma chamada HTTP, demonstrando o uso prático do $mustache, para construção da URL.

### Node 7
Nova userTask, novamente na lane 1.
Exige que a submissão contenha o campo is_order_ok.

### Node 8
Apresenta um FlowNode, que roteia o fluxo em função do valor do campo is_order_ok do nó 7.

