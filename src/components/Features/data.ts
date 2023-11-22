import feature1 from "../../assets/images/home/1-Plataforma personalizada - comp.png";
import feature2 from "../../assets/images/home/2-Conteudos pre-vestibular - comp.png";
import feature3 from "../../assets/images/home/3-Redaçoes corrigidas - comp.png";
import feature4 from "../../assets/images/home/4-Exercicios e Simulados online - comp.png";
import feature5 from "../../assets/images/home/5-Forum de duvidas - comp.png";
import { FeatureData } from "./types";

export const features : FeatureData = {
    title: 'O futuro do cursinho popular',
    subtitle: 'Veja tudo o que você terá acesso na nossa plataforma!',
    feats: [
        {
            id: 1,
            title: "Plataforma personalizada",
            subtitle: "Ao acessar a plataforma Você na Facul você terá um painel só seu, personalizado de acordo com seu perfil e seu progresso nos estudos! [EM BREVE]",
            image: feature1,
        },
        {
            id: 2,
            title: "Conteúdos pré-vestibular",
            subtitle:  "Você terá acesso aos melhores conteúdos pré-vestibular que existem hoje, que foram selecionados com carinho e organizados para você! [EM BREVE]",
            image: feature2,
        },
        {
            id: 3,
            title: "Suas redações corrigidas",
            subtitle: "Tá precisando melhorar nas redações? É só escrever quantas quiser e enviar pelo painel que um professor vai corrigir e dar sugestões de melhoria! [EM BREVE]",
            image: feature3,
        },
        {
            id: 4,
            title: "Exercícios e Simulados online",
            subtitle: "O Você na Facul disponibiliza simulados automáticos com questões reais para você praticar quantas vezes quiser! E o resultado sai na hora! [EM BREVE]",
            image: feature4,
        },
        {
            id: 5,
            title: "Fórum de dúvidas",
            subtitle: "Tá com dúvidas sobre os conteúdos? É só mandar uma mensagem no fórum de dúvidas que algum professor vai te ajudar com o maior prazer! [EM BREVE]",
            image: feature5,
        },
    ]
}