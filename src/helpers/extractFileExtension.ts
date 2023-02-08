const extractFileExtension = (contentType: string): string | undefined =>
  contentType.split('/')[1];

export default extractFileExtension;
