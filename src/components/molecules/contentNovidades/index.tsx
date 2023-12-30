import './content.css';
import Content from '../../atoms/content';

interface ContentSubjectProps {
  docxFilePath?: string;
  className?: string;
}

function ContentnEWS({ docxFilePath, className }: ContentSubjectProps) {
  return (
    <Content docxFilePath={docxFilePath} className={className}/>
  );
}

export default ContentnEWS;
